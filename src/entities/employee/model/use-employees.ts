import { useGetQuery } from '@shared/api';
import { useDebouncedValue } from '@shared/lib';

import { employeeEndpoints } from '../api/employee-api';
import type { Employee, EmployeesResponse } from './types';

export const useEmployees = (searchText = '', enabled = true) => {
  const search = useDebouncedValue(searchText);
  const query = useGetQuery<EmployeesResponse>({
    queryKey: ['employees', search],
    url: employeeEndpoints.list,
    params: { active: true, limit: 0, name: search, page: 1, role_id: '' },
    options: { enabled },
  });
  const payload = query.data?.payload;
  const employees: Employee[] = Array.isArray(payload) ? payload : (payload?.data ?? []);

  return { ...query, employees };
};
