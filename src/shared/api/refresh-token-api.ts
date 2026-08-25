import axios from 'axios';

import { env } from '@shared/config';

type RefreshTokenResponse = ApiResponse<{
  access_token: string;
  refresh_token?: string;
}>;

const authHttpClient = axios.create({ baseURL: env.apiBaseUrl });

export const refreshAccessToken = (refreshToken: string) =>
  authHttpClient.post<RefreshTokenResponse>('/auth/refresh_token', {
    refresh_token: refreshToken,
  });
