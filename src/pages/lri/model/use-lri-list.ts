import { useMemo } from 'react';

import type { StockAssetListResponse } from '@entities/stock-asset';
import { useGetQuery } from '@shared/api';

import { lriEndpoints } from '../api/lri-api';
import { buildLriListParams } from './build-lri-list-params';
import type { LriFilters } from './lri-filters';

type UseLriListParams = {
  filters: LriFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const useLriList = ({ filters, limit, page, searchText }: UseLriListParams) => {
  const params = useMemo(
    () => buildLriListParams(filters, page, limit, searchText),
    [filters, limit, page, searchText],
  );
  const query = useGetQuery<StockAssetListResponse>({
    queryKey: ['lri'],
    url: lriEndpoints.list,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
