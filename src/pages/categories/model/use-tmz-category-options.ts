import { useGetQuery } from '@shared/api';

import { categoriesEndpoints } from '../api/categories-api';
import type { ExpenseType, StorageOption, TmzCategory } from './types';

export const useTmzCategoryOptions = (enabled: boolean) => {
  const storagesQuery = useGetQuery<
    ApiResponse<{ items?: StorageOption[] }>
  >({
    queryKey: ['category-storages'],
    url: categoriesEndpoints.storages,
    params: { limit: 100, page: 1 },
    options: { enabled },
  });
  const expenseTypesQuery = useGetQuery<ApiResponse<ExpenseType[]>>({
    queryKey: ['category-expense-types'],
    url: categoriesEndpoints.expenseTypes,
    options: { enabled },
  });
  const categoriesQuery = useGetQuery<ApiResponse<{ tmz?: TmzCategory[] }>>({
    queryKey: ['category-tmz-options'],
    url: categoriesEndpoints.tmzList,
    params: { LIMIT: 0, PAGE: 0, SEARCH_TEXT: '' },
    options: { enabled },
  });

  return {
    categories: categoriesQuery.data?.payload.tmz ?? [],
    expenseTypes: expenseTypesQuery.data?.payload ?? [],
    isLoading:
      storagesQuery.isLoading || expenseTypesQuery.isLoading || categoriesQuery.isLoading,
    storages: storagesQuery.data?.payload.items ?? [],
  };
};
