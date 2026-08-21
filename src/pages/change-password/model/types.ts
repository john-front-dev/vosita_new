import type { z } from 'zod';

import type { changePasswordSchema } from './validation';

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export type ChangePasswordRequest = {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
};
