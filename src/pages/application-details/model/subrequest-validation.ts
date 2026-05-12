import { z } from 'zod';

export const subrequestSchema = z.object({
  categoryId: z.string().min(1, 'Выберите категорию'),
  name: z.string().trim().min(1, 'Введите имя'),
  price: z.string().trim().min(1, 'Введите цену'),
  quantity: z.string().trim().min(1, 'Введите количество'),
  unit: z.string().min(1, 'Выберите ед. измерения'),
});

export type SubrequestFormValues = z.infer<typeof subrequestSchema>;

export const subrequestDefaultValues: SubrequestFormValues = {
  categoryId: '',
  name: '',
  price: '1',
  quantity: '1',
  unit: '',
};
