import { z } from 'zod';

import type { ExpenseType } from './types';

const requiredSelect = (message: string) => z.string().min(1, message);

const tmzCategoryBindingSchema = z.object({
  categoryId: requiredSelect('Выберите категорию'),
  expenseTypeId: requiredSelect('Выберите тип расхода'),
  storageId: requiredSelect('Выберите склад'),
});

export const createTmzCategoryFormSchema = (expenseTypes: ExpenseType[]) =>
  z
    .object({
      rows: z.array(tmzCategoryBindingSchema).min(1).max(5),
    })
    .superRefine(({ rows }, context) => {
      rows.forEach(({ expenseTypeId }, index) => {
        if (
          expenseTypeId &&
          !expenseTypes.some(({ branchName, id }) => id === expenseTypeId && branchName)
        ) {
          context.addIssue({
            code: 'custom',
            message: 'Для типа расхода не указана локация',
            path: ['rows', index, 'expenseTypeId'],
          });
        }
      });
    })
    .transform(({ rows }) => ({
      rows: rows.map((row) => ({
        ...row,
        expenseType: expenseTypes.find(({ id }) => id === row.expenseTypeId) as ExpenseType & {
          branchName: string;
        },
      })),
    }));

export type TmzCategoryFormInput = z.input<
  ReturnType<typeof createTmzCategoryFormSchema>
>;

export type TmzCategoryFormValues = z.output<
  ReturnType<typeof createTmzCategoryFormSchema>
>;

export const tmzCategoryFormDefaultValues: TmzCategoryFormInput = {
  rows: [{ categoryId: '', expenseTypeId: '', storageId: '' }],
};
