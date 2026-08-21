import { snackbar } from 'alif-ui';
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@shared/config';

import { notifyAuthSessionExpired } from '../lib/auth-session-events';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  updateStoredAuthTokens,
} from '../lib/auth-storage';

const AUTH_REFRESH_URL = '/auth/refresh_token';
const SKIP_ERROR_SNACKBAR_HEADER = 'x-skip-error-snackbar';

type RefreshTokenResponse = ApiResponse<{
  access_token: string;
  refresh_token?: string;
}>;

type RetryRequestConfig = InternalAxiosRequestConfig & {
  isRetry?: boolean;
};

let refreshTokenPromise: Promise<string> | null = null;
let expiredSessionKey: string | null = null;

const serializeParams = (params?: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      const normalizedValue = value
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean);

      if (normalizedValue.length) {
        searchParams.set(key, normalizedValue.join(','));
      }

      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: serializeParams,
  },
});

const refreshHttpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const showErrorSnackbar = (title: string, subtitle?: string) => {
  snackbar.show({
    title,
    subtitle,
    type: 'error',
    withCloseButton: true,
    duration: 5000,
  });
};

const getErrorMessage = (error: AxiosError<ApiErrorPayload>) => {
  if (!error.response) {
    return error.message || 'Network error';
  }

  return (
    error.response.data?.message ??
    error.response.data?.payload?.message ??
    error.response.statusText ??
    'Request error'
  );
};

const shouldSkipErrorSnackbar = (config?: InternalAxiosRequestConfig) =>
  Boolean(config?.headers?.get?.(SKIP_ERROR_SNACKBAR_HEADER));

const isCanceledRequest = (error: AxiosError) =>
  axios.isCancel(error) || error.code === AxiosError.ERR_CANCELED;

const clearAuthTokens = () => {
  clearAuthSession();
};

const expireSession = () => {
  const sessionKey = `${getStoredAccessToken()}:${getStoredRefreshToken()}`;

  clearAuthTokens();

  if (expiredSessionKey && (expiredSessionKey === sessionKey || sessionKey === 'null:null')) {
    return;
  }

  expiredSessionKey = sessionKey;
  showErrorSnackbar('Сессия истекла', 'Пожалуйста, авторизуйтесь заново');
  notifyAuthSessionExpired();
};

const requestNewAccessToken = async () => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token is missing');
  }

  const response = await refreshHttpClient.post<RefreshTokenResponse>(AUTH_REFRESH_URL, {
    refresh_token: refreshToken,
  });

  const accessToken = response.data.payload.access_token;
  const nextRefreshToken = response.data.payload.refresh_token;

  if (!accessToken) {
    throw new Error('Access token is missing in refresh response');
  }

  updateStoredAuthTokens({ accessToken, refreshToken: nextRefreshToken });

  return accessToken;
};

const getRefreshedAccessToken = () => {
  refreshTokenPromise ??= requestNewAccessToken().finally(() => {
    refreshTokenPromise = null;
  });

  return refreshTokenPromise;
};

const handleUnauthorizedError = async (error: AxiosError<ApiErrorPayload>) => {
  const originalConfig = error.config as RetryRequestConfig | undefined;

  if (!originalConfig || originalConfig.isRetry || originalConfig.url?.includes(AUTH_REFRESH_URL)) {
    expireSession();
    throw error;
  }

  originalConfig.isRetry = true;

  try {
    const accessToken = await getRefreshedAccessToken();

    originalConfig.headers.Authorization = `Bearer ${accessToken}`;

    return httpClient.request(originalConfig);
  } catch (refreshError) {
    expireSession();

    throw refreshError;
  }
};

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    if (isCanceledRequest(error)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      return handleUnauthorizedError(error);
    }

    if (!shouldSkipErrorSnackbar(error.config)) {
      showErrorSnackbar('Ошибка запроса', getErrorMessage(error));
    }

    return Promise.reject(error);
  },
);
