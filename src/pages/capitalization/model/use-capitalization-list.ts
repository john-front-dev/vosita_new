import { useGetQuery } from '@shared/api';

import { capitalizationEndpoints } from '../api/capitalization-api';
import type { CapitalizationListParams, CapitalizationListResponse } from './types';

export const useCapitalizationList = (params: CapitalizationListParams) => {
  const query = useGetQuery<CapitalizationListResponse>({
    queryKey: ['capitalization-list'],
    url: capitalizationEndpoints.list,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * params.LIMIT,
  };
};
