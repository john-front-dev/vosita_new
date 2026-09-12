import { useMemo } from 'react';

import type { Employee, EmployeesResponse } from '@entities/employee';
import { useGetQuery } from '@shared/api';

import { employeesEndpoints } from '../api/employees-api';
import type { EmployeesFilters } from './employees-filters';

type UseEmployeesListParams = {
  filters: EmployeesFilters;
  limit: number;
  page: number;
  searchText: string;
};

export const useEmployeesList = ({ filters, limit, page, searchText }: UseEmployeesListParams) => {
  const params = useMemo(
    () => ({
      ACCESS_ID: filters.access_id.join(','),
      ACTIVE: searchText ? undefined : true,
      LIMIT: limit,
      NAME: searchText.trim(),
      PAGE: page,
      ROLE_ID: filters.role_id.join(','),
    }),
    [filters.access_id, filters.role_id, limit, page, searchText],
  );
  const query = useGetQuery<EmployeesResponse>({
    queryKey: ['employees-list'],
    url: employeesEndpoints.list,
    params,
  });
  const payload = query.data?.payload;
  const records: Employee[] = Array.isArray(payload) ? payload : (payload?.data ?? []);

  return {
    ...query,
    records,
    totalCount: Array.isArray(payload)
      ? payload.length
      : (payload?.total_count ?? (payload?.total_pages ?? 0) * limit),
  };
};
