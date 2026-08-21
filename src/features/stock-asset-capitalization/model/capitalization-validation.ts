import { z } from 'zod';

export const capitalizationSchema = z.object({
  comment: z.string(),
  currency: z.enum(['TJS', 'RUB', 'USD']),
  date: z.date({ error: 'Выберите дату' }),
  price: z.string().refine((value) => Number(value) > 0, 'Введите сумму больше нуля'),
});

export type CapitalizationFormValues = z.infer<typeof capitalizationSchema>;

export const getCapitalizationDefaultValues = (): CapitalizationFormValues => ({
  comment: '',
  currency: 'TJS',
  date: new Date(),
  price: '',
});
