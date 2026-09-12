import { useGetQuery } from '@shared/api';

import { employeeEndpoints } from '../api/employee-api';
import type { EmployeeFixedAssetHistory, EmployeeMbpHistory, EmployeeUserAction } from './types';

export const useEmployeeFixedAssetHistory = (id?: string, enabled = true) => {
  const query = useGetQuery<ApiResponse<EmployeeFixedAssetHistory[]>>({
    queryKey: ['employee-fixed-asset-history', id],
    url: employeeEndpoints.fixedAssetHistory,
    params: { user_id: id },
    options: { enabled: Boolean(id && enabled) },
  });

  return { ...query, records: query.data?.payload ?? [] };
};

export const useEmployeeMbpHistory = (id?: string, enabled = true) => {
  const query = useGetQuery<ApiResponse<EmployeeMbpHistory[]>>({
    queryKey: ['employee-mbp-history', id],
    url: employeeEndpoints.mbpHistory(id ?? ''),
    options: { enabled: Boolean(id && enabled) },
  });

  return { ...query, records: query.data?.payload ?? [] };
};

export const useEmployeeUserActions = (id?: string, enabled = true) => {
  const query = useGetQuery<ApiResponse<EmployeeUserAction[]>>({
    queryKey: ['employee-user-actions', id],
    url: employeeEndpoints.userActions,
    params: { user_id: id },
    options: { enabled: Boolean(id && enabled) },
  });

  return { ...query, records: query.data?.payload ?? [] };
};
