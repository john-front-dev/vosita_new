import { useMemo } from 'react';

import type { StockListResponse } from '@pages/stock/model/types';

import { useGetQuery } from '@shared/api';

import { fixedAssetsEndpoints } from '../api/fixed-assets-api';
import { buildFixedAssetsListParams } from './build-fixed-assets-list-params';
import type { FixedAssetsFilters } from './fixed-assets-filters';

type UseFixedAssetsListParams = {
  filters: FixedAssetsFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const useFixedAssetsList = ({
  filters,
  limit,
  page,
  searchText,
}: UseFixedAssetsListParams) => {
  const params = useMemo(
    () => buildFixedAssetsListParams(filters, page, limit, searchText),
    [filters, limit, page, searchText],
  );
  const query = useGetQuery<StockListResponse>({
    queryKey: ['fixed-assets'],
    url: fixedAssetsEndpoints.list,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
