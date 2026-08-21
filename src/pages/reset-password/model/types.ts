import type { z } from 'zod';

import type { resetPasswordSchema } from './validation';

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export type ResetPasswordRequest = {
  password: string;
  passwordConfirm: string;
};
