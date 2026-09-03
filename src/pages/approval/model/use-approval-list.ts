import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { approvalEndpoints } from '../api/approval-api';
import type { ApprovalFilters, ApprovalListParams, ApprovalListResponse } from './types';

type Params = {
  filters: ApprovalFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const useApprovalList = ({ filters, limit, page, searchText }: Params) => {
  const params = useMemo<ApprovalListParams>(
    () => ({
      limit,
      offset: page - 1,
      ...(searchText ? { search: searchText } : {}),
      ...(filters.status_id[0] ? { status_id: filters.status_id[0] } : {}),
      ...(filters.operation_type_id[0] ? { operation_type_id: filters.operation_type_id[0] } : {}),
      ...(filters.item_type_id[0] ? { item_type_id: filters.item_type_id[0] } : {}),
      ...(filters.from_storage_id[0] ? { from_storage_id: filters.from_storage_id[0] } : {}),
      ...(filters.to_storage_id[0] ? { to_storage_id: filters.to_storage_id[0] } : {}),
    }),
    [filters, limit, page, searchText],
  );

  const query = useGetQuery<ApprovalListResponse>({
    queryKey: ['approval', params],
    url: approvalEndpoints.list,
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.items ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
