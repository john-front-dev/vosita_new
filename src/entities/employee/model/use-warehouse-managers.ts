import { useGetQuery } from '@shared/api';
import { useDebouncedValue } from '@shared/lib';

import { employeeEndpoints } from '../api/employee-api';
import type { WarehouseManagersResponse } from './types';

export const useWarehouseManagers = (subdivisionId?: string, searchText = '', enabled = true) => {
  const search = useDebouncedValue(searchText);
  const query = useGetQuery<WarehouseManagersResponse>({
    queryKey: ['warehouse-managers', subdivisionId, search],
    url: employeeEndpoints.warehouseManagers,
    params: { name: search, subdivision_id: subdivisionId ?? '' },
    options: { enabled: enabled && Boolean(subdivisionId) },
  });

  return {
    ...query,
    warehouseManagers: query.data?.payload ?? [],
  };
};
