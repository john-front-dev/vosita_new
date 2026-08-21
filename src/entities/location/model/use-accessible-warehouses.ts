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
