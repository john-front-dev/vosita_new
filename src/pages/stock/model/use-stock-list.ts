import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { getStockRequestConfig, stockListEndpoints } from '../api/stock-api';
import { buildStockListParams } from '../lib/build-stock-list-params';
import type { StockFilters, StockListResponse, StockListType } from './types';

type UseStockListParams = {
  filters: StockFilters;
  limit: number;
  page: number;
  searchText?: string;
  type: StockListType;
};

export const useStockList = ({ filters, limit, page, searchText, type }: UseStockListParams) => {
  const queryParams = useMemo(
    () =>
      buildStockListParams({
        filters,
        limit,
        page,
        searchText,
        type,
      }),
    [filters, limit, page, searchText, type],
  );

  const query = useGetQuery<StockListResponse>({
    queryKey: ['stock', type],
    url: stockListEndpoints[type],
    ...getStockRequestConfig(queryParams),
  });

  const payload = query.data?.payload;
  const records = payload?.data ?? payload?.items ?? [];
  const totalPages = payload?.total_pages ?? 0;
  const totalCount = payload?.total_count ?? totalPages * limit;

  return {
    ...query,
    records,
    totalCount,
    totalPages,
  };
};
