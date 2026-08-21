export const resetPasswordApi = {
  changePassword: (id: string) => `/auth/resetpassword/${id}`,
} as const;
