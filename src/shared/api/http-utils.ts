import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const SKIP_ERROR_SNACKBAR_HEADER = 'x-skip-error-snackbar';

export const getApiErrorMessage = (error: AxiosError<ApiErrorPayload>) => {
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

export const shouldSkipErrorSnackbar = (config?: InternalAxiosRequestConfig) =>
  Boolean(config?.headers?.get?.(SKIP_ERROR_SNACKBAR_HEADER));

export const isCanceledRequest = (error: AxiosError) =>
  axios.isCancel(error) || error.code === AxiosError.ERR_CANCELED;
