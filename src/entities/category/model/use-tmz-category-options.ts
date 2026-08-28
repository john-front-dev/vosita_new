import { useGetQuery } from '@shared/api';

import { categoryEndpoints } from '../api/category-api';

type TmzCategoryOption = {
  id: number;
  name: string;
};

type TmzCategoryOptionsResponse = ApiResponse<{
  tmz: TmzCategoryOption[];
}>;

export const useTmzCategoryOptions = (enabled = true) => {
  const query = useGetQuery<TmzCategoryOptionsResponse>({
    queryKey: ['tmz-category-options'],
    url: categoryEndpoints.tmzList,
    params: { PAGE: 0, SEARCH_TEXT: '' },
    options: { enabled },
  });

  return { ...query, categories: query.data?.payload.tmz ?? [] };
};
