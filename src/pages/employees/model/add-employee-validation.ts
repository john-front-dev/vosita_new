import { z } from 'zod';

export const addEmployeeSchema = z.object({
  email: z.string().trim().min(1, 'Введите электронную почту').email('Некорректная почта'),
  name: z.string().trim().min(2, 'Введите минимум 2 символа'),
});

export type AddEmployeeFormValues = z.infer<typeof addEmployeeSchema>;

export const addEmployeeDefaultValues: AddEmployeeFormValues = { email: '', name: '' };
