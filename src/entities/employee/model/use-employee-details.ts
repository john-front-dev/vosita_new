import { useGetQuery } from '@shared/api';

import { employeeEndpoints } from '../api/employee-api';
import type { EmployeeDetailsResponse } from './types';

export const useEmployeeDetails = (id?: string, page = 1) => {
  const query = useGetQuery<EmployeeDetailsResponse>({
    queryKey: ['employee-details', id, page],
    url: employeeEndpoints.details(id ?? ''),
    params: { page },
    options: { enabled: Boolean(id) },
  });

  return { ...query, employee: query.data?.payload };
};
