import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@shared/config';
import { notifyError, serializeQueryParams } from '@shared/lib';

import { notifyAuthSessionExpired } from '../lib/auth-session-events';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  updateStoredAuthTokens,
} from '../lib/auth-storage';
import { refreshAccessToken } from './auth-api';
import { getApiErrorMessage, isCanceledRequest, shouldSkipErrorSnackbar } from './http-utils';

type RetryRequestConfig = InternalAxiosRequestConfig & {
  isRetry?: boolean;
};

let refreshTokenPromise: Promise<string> | null = null;
let expiredSessionKey: string | null = null;

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  paramsSerializer: {
    serialize: serializeQueryParams,
  },
});

const expireSession = () => {
  const sessionKey = `${getStoredAccessToken()}:${getStoredRefreshToken()}`;

  clearAuthSession();

  if (expiredSessionKey && (expiredSessionKey === sessionKey || sessionKey === 'null:null')) {
    return;
  }

  expiredSessionKey = sessionKey;
  notifyError('Сессия истекла', 'Пожалуйста, авторизуйтесь заново');
  notifyAuthSessionExpired();
};

const requestNewAccessToken = async () => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token is missing');
  }

  const response = await refreshAccessToken(refreshToken);

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

  if (!originalConfig || originalConfig.isRetry) {
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
      notifyError('Ошибка запроса', getApiErrorMessage(error));
    }

    return Promise.reject(error);
  },
);
