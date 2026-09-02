import { useGetQuery } from '@shared/api';

import { locationEndpoints } from '../api/location-api';
import type {
  AccessibleWarehouse,
  AccessibleWarehousesPayload,
  AccessibleWarehousesResponse,
} from './types';

const getWarehousesFromPayload = (payload?: AccessibleWarehousesPayload): AccessibleWarehouse[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.items ?? [];
};

export const useAccessibleWarehouses = () => {
  const query = useGetQuery<AccessibleWarehousesResponse>({
    queryKey: ['accessible-warehouses'],
    url: locationEndpoints.accessibleWarehouses,
  });

  return {
    ...query,
    warehouses: getWarehousesFromPayload(query.data?.payload),
  };
};

export const useAllWarehouses = (enabled: boolean, subdivisionId = '') => {
  const query = useGetQuery<AccessibleWarehousesResponse>({
    queryKey: ['all-warehouses', subdivisionId],
    url: locationEndpoints.allWarehouses,
    params: { limit: 0, name: '', page: 1, subdivision_id: subdivisionId },
    options: { enabled },
  });

  return {
    ...query,
    warehouses: getWarehousesFromPayload(query.data?.payload),
  };
};
