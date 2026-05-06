import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Введите эл. почту'),
  password: z.string().min(1, 'Введите пароль'),
  remember: z.boolean(),
});
