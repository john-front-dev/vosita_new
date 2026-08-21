import { apiRoutes } from '@shared/api/routes';

export const resetPasswordApi = {
  changePassword: apiRoutes.auth.resetPassword,
} as const;
