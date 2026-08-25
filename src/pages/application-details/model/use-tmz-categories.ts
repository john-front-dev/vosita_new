import { applicationDictionaryEndpoints } from '@entities/application';
import { useGetQuery } from '@shared/api';

import type { TmzCategoriesPayload, TmzCategoriesResponse } from './types';

const getCategoriesFromPayload = (payload?: TmzCategoriesPayload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.tmz ?? [];
};

type UseTmzCategoriesParams = {
  enabled?: boolean;
};

export const useTmzCategories = ({ enabled = true }: UseTmzCategoriesParams = {}) => {
  const query = useGetQuery<TmzCategoriesResponse>({
    queryKey: ['tmz-categories'],
    url: applicationDictionaryEndpoints.tmzCategories,
    params: {
      PAGE: 0,
      SEARCH_TEXT: '',
    },
    options: {
      enabled,
      refetchOnMount: 'always',
    },
  });

  return {
    ...query,
    categories: getCategoriesFromPayload(query.data?.payload),
  };
};
