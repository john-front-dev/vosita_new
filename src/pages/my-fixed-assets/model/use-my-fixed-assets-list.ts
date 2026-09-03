import { useMemo } from 'react';

import type { StockAsset } from '@entities/stock-asset';
import { useGetQuery } from '@shared/api';

import { myFixedAssetsEndpoints } from '../api/my-fixed-assets-api';
import { buildMyFixedAssetsListParams } from './build-my-fixed-assets-list-params';
import type { MyFixedAssetsFilters } from './my-fixed-assets-filters';

type MyFixedAssetsListResponse = ApiResponse<PaginatedPayload<StockAsset>>;

type Params = {
  filters: MyFixedAssetsFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const useMyFixedAssetsList = ({ filters, limit, page, searchText }: Params) => {
  const params = useMemo(
    () => buildMyFixedAssetsListParams(filters, page, limit, searchText),
    [filters, limit, page, searchText],
  );
  const query = useGetQuery<MyFixedAssetsListResponse>({
    queryKey: ['my-fixed-assets'],
    url: myFixedAssetsEndpoints.list,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
