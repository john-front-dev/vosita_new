import { useGetQuery } from '@shared/api';

import { mbpEndpoints } from '../api/mbp-api';
import type { MbpListResponse } from './types';

export const useMbpFilterOptions = () => {
  const query = useGetQuery<MbpListResponse>({
    queryKey: ['mbp-filter-options'],
    url: mbpEndpoints.list,
    params: { limit: 1000, page: 1 },
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.items ?? payload?.data ?? [],
  };
};
