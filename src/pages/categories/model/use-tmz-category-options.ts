import { useGetQuery } from '@shared/api';

import { categoriesEndpoints } from '../api/categories-api';
import type { ExpenseType, StorageOption, TmzCategory } from './types';

export const useTmzCategoryOptions = (enabled: boolean) => {
  const { data: storagesData, isLoading: isStoragesLoading } = useGetQuery<
    ApiResponse<{ items?: StorageOption[] }>
  >({
    queryKey: ['category-storages'],
    url: categoriesEndpoints.storages,
    params: { limit: 100, page: 1 },
    options: { enabled },
  });
  const { data: expenseTypesData, isLoading: isExpenseTypesLoading } = useGetQuery<ApiResponse<ExpenseType[]>>({
    queryKey: ['category-expense-types'],
    url: categoriesEndpoints.expenseTypes,
    options: { enabled },
  });
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetQuery<ApiResponse<{ tmz?: TmzCategory[] }>>({
    queryKey: ['category-tmz-options'],
    url: categoriesEndpoints.tmzList,
    params: { LIMIT: 0, PAGE: 0, SEARCH_TEXT: '' },
    options: { enabled },
  });

  return {
    categories: categoriesData?.payload.tmz ?? [],
    expenseTypes: expenseTypesData?.payload ?? [],
    isLoading: isStoragesLoading || isExpenseTypesLoading || isCategoriesLoading,
    storages: storagesData?.payload.items ?? [],
  };
};
