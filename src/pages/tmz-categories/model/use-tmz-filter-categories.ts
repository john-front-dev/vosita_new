import { useGetQuery } from '@shared/api';

import { tmzCategoriesEndpoints } from '../api/tmz-categories-api';

type TmzFilterCategory = {
  id: number;
  name: string;
};

type TmzFilterCategoriesResponse = ApiResponse<{
  tmz: TmzFilterCategory[];
}>;

export const useTmzFilterCategories = (enabled = true) => {
  const query = useGetQuery<TmzFilterCategoriesResponse>({
    queryKey: ['tmz-filter-categories'],
    url: tmzCategoriesEndpoints.filterCategories,
    params: { PAGE: 0, SEARCH_TEXT: '' },
    options: { enabled },
  });

  return { ...query, categories: query.data?.payload.tmz ?? [] };
};
