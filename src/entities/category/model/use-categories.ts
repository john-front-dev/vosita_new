import { useGetQuery } from '@shared/api';
import { useDebouncedValue } from '@shared/lib';

import { categoryEndpoints } from '../api/category-api';
import type { CategoriesResponse } from './types';

export const useCategories = (searchText = '', enabled = true) => {
  const search = useDebouncedValue(searchText);
  const query = useGetQuery<CategoriesResponse>({
    queryKey: ['categories', search],
    url: categoryEndpoints.list,
    params: { limit: 0, name: search, page: 1 },
    options: { enabled },
  });

  return {
    ...query,
    categories: query.data?.payload.data ?? [],
  };
};

export const useMbpCategories = (searchText = '', enabled = true) => {
  const search = useDebouncedValue(searchText);
  const query = useGetQuery<CategoriesResponse>({
    queryKey: ['mbp-categories', search],
    url: categoryEndpoints.mbpList,
    params: { limit: 0, page: 1, search },
    options: { enabled },
  });
  return { ...query, categories: query.data?.payload.data ?? [] };
};
