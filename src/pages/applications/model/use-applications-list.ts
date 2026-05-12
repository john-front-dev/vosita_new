import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { applicationListEndpoints } from '../api/applications-api';
import { buildApplicationListParams } from '../lib/build-application-list-params';
import type {
  ApplicationFilters,
  ApplicationListParams,
  ApplicationListResponse,
  ApplicationListType,
} from './types';

type UseApplicationsListParams = {
  filters: ApplicationFilters;
  limit: number;
  page: number;
  searchText?: string;
  type: ApplicationListType;
};

export const useApplicationsList = ({
  filters,
  limit,
  page,
  searchText,
  type,
}: UseApplicationsListParams) => {
  const queryParams = useMemo<ApplicationListParams>(
    () =>
      buildApplicationListParams({
        limit,
        page,
        searchText,
        departmentIds: filters.DEPARTMENT_ID,
        storageIds: filters.STORAGE_ID,
        subdivisionIds: filters.SUBDIVISION_ID,
      }),
    [filters.DEPARTMENT_ID, filters.STORAGE_ID, filters.SUBDIVISION_ID, limit, page, searchText],
  );

  const query = useGetQuery<ApplicationListResponse>({
    queryKey: ['applications', type],
    url: applicationListEndpoints[type],
    params: queryParams,
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
