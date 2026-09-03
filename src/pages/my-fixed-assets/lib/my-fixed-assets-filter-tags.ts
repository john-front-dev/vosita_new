import type { Category } from '@entities/category';
import type { Employee } from '@entities/employee';
import { buildAppliedFilterTags } from '@shared/lib';

import type {
  MyFixedAssetsFilterKey,
  MyFixedAssetsFilters,
} from '../model/my-fixed-assets-filters';

export const getAppliedMyFixedAssetsFilters = (
  filters: MyFixedAssetsFilters,
  employees: Employee[],
  categories: Category[],
) =>
  buildAppliedFilterTags<MyFixedAssetsFilterKey>([
    {
      key: 'EXPLOITER_ID',
      options: employees.map((employee) => ({
        label: employee.full_name,
        value: String(employee.id),
      })),
      title: 'Пользователь',
      value: filters.EXPLOITER_ID[0],
    },
    {
      key: 'CATEGORY_ID',
      options: categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
      title: 'Категория',
      value: filters.CATEGORY_ID[0],
    },
  ]);
