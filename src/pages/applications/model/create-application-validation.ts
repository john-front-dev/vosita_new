import { z } from 'zod';

export const createApplicationSchema = z.object({
  category: z.string().min(1, 'Выберите тип товара'),
  departmentId: z.string().optional(),
  description: z.string().optional(),
  storageId: z.string().min(1, 'Выберите склад'),
  subdivisionId: z.string().optional(),
  title: z.string().trim().min(1, 'Введите название'),
});

export type CreateApplicationFormValues = z.infer<typeof createApplicationSchema>;

export const createApplicationDefaultValues: CreateApplicationFormValues = {
  category: '',
  departmentId: '',
  description: '',
  storageId: '',
  subdivisionId: '',
  title: '',
};
