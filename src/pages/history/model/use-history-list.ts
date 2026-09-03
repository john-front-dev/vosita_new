import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { historyEndpoints } from '../api/history-api';
import type { HistoryFilters, HistoryListParams, HistoryListResponse } from './types';

type UseHistoryListParams = {
  filters: HistoryFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const useHistoryList = ({ filters, limit, page, searchText }: UseHistoryListParams) => {
  const params = useMemo<HistoryListParams>(
    () => ({
      limit,
      page,
      ...(searchText ? { search_text: searchText } : {}),
      ...(filters.warehouse_id[0] ? { warehouse_id: filters.warehouse_id[0] } : {}),
      ...(filters.operation_type[0] ? { operation_type: filters.operation_type[0] } : {}),
      ...(filters.initiator[0] ? { initiator: filters.initiator[0] } : {}),
      ...(filters.start_date[0] ? { start_date: filters.start_date[0] } : {}),
      ...(filters.end_date[0] ? { end_date: filters.end_date[0] } : {}),
    }),
    [filters, limit, page, searchText],
  );

  const query = useGetQuery<HistoryListResponse>({
    queryKey: ['history-list', params],
    url: historyEndpoints.list,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
