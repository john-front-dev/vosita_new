import { useMemo } from 'react';

import type { StockAsset } from '@entities/stock-asset';
import { useGetQuery } from '@shared/api';

import { othersEndpoints } from '../api/others-api';
import { buildOthersListParams } from './build-others-list-params';
import type { OthersFilters } from './others-filters';

type OthersListResponse = ApiResponse<PaginatedPayload<StockAsset>>;

type UseOthersListParams = {
  filters: OthersFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const useOthersList = ({ filters, limit, page, searchText }: UseOthersListParams) => {
  const params = useMemo(
    () => buildOthersListParams(filters, page, limit, searchText),
    [filters, limit, page, searchText],
  );
  const query = useGetQuery<OthersListResponse>({
    queryKey: ['others'],
    url: othersEndpoints.list,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
