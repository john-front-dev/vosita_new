import axios from 'axios';

import { env } from '@shared/config';

import { apiRoutes } from './routes';

type RefreshTokenResponse = ApiResponse<{
  access_token: string;
  refresh_token?: string;
}>;

const authHttpClient = axios.create({ baseURL: env.apiBaseUrl });

export const refreshAccessToken = (refreshToken: string) =>
  authHttpClient.post<RefreshTokenResponse>(apiRoutes.auth.refreshToken, {
    refresh_token: refreshToken,
  });
