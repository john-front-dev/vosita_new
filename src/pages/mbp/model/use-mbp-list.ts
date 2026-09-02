import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { mbpEndpoints } from '../api/mbp-api';
import { buildMbpListParams } from './build-mbp-list-params';
import type { MbpFilters } from './mbp-filters';
import type { MbpListResponse } from './types';

type UseMbpListParams = {
  filters: MbpFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const useMbpList = ({ filters, limit, page, searchText }: UseMbpListParams) => {
  const params = useMemo(
    () => buildMbpListParams(filters, page, limit, searchText),
    [filters, limit, page, searchText],
  );
  const query = useGetQuery<MbpListResponse>({
    queryKey: ['mbp'],
    url: mbpEndpoints.list,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.items ?? payload?.data ?? [],
    totalCount:
      payload?.total_count ?? payload?.total ?? (payload?.total_pages ?? 0) * limit,
  };
};
