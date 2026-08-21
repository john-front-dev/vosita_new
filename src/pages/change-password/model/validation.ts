import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(6, 'Минимальная длина старого пароля 6 символов'),
    new_password: z.string().min(6, 'Минимальная длина пароля 6 символов'),
    confirm_new_password: z.string().min(6, 'Минимальная длина пароля 6 символов'),
  })
  .refine((values) => values.new_password === values.confirm_new_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_new_password'],
  });
