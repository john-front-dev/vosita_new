import { useGetQuery } from '@shared/api';

import { categoriesEndpoints } from '../api/categories-api';
import type { CategoryListResponse, CategoryType } from './types';

type Params = { limit: number; page: number; searchText: string; type: CategoryType };

export const useCategoriesList = ({ limit, page, searchText, type }: Params) => {
  const url =
    type === 'os'
      ? categoriesEndpoints.osList
      : type === 'tmz'
        ? categoriesEndpoints.tmzList
        : categoriesEndpoints.mbpList;
  const params =
    type === 'os'
      ? { LIMIT: limit, NAME: searchText, PAGE: page }
      : type === 'tmz'
        ? { LIMIT: limit, PAGE: page, SEARCH_TEXT: searchText }
        : { limit, page, search: searchText };
  const query = useGetQuery<CategoryListResponse>({
    queryKey: ['categories-page-list', type],
    url,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? payload?.tmz ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
