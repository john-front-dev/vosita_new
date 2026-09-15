import { useGetQuery } from '@shared/api';

import { locationEndpoints } from '../api/location-api';
import type {
  AccessibleWarehouseDto,
  AccessibleWarehousesResponse,
  StorageDto,
  StoragesResponse,
  WarehouseLocation,
} from './types';

type ListPayload<T> = T[] | { items?: T[] };

const getItems = <T>(payload?: ListPayload<T>): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.items ?? [];
};

const normalizeAccessibleWarehouse = (warehouse: AccessibleWarehouseDto): WarehouseLocation => ({
  department_id: warehouse.dep_id,
  department_name: warehouse.dep_name,
  storage_id: warehouse.storage_id,
  storage_name: warehouse.storage_name,
  subdivision_id: warehouse.sub_id,
  subdivision_name: warehouse.sub_name,
});

const normalizeStorage = (storage: StorageDto): WarehouseLocation => ({
  department_id: storage.department_id,
  department_name: storage.department_name,
  storage_id: storage.id,
  storage_name: storage.name,
  subdivision_id: storage.subdivision_id,
  subdivision_name: storage.subdivision_name,
});

export const useAccessibleWarehouses = () => {
  const query = useGetQuery<AccessibleWarehousesResponse>({
    queryKey: ['accessible-warehouses'],
    url: locationEndpoints.accessibleWarehouses,
  });

  return {
    ...query,
    warehouses: getItems(query.data?.payload).map(normalizeAccessibleWarehouse),
  };
};

export const useAllWarehouses = (enabled: boolean, subdivisionId = '') => {
  const query = useGetQuery<StoragesResponse>({
    queryKey: ['all-warehouses', subdivisionId],
    url: locationEndpoints.allWarehouses,
    params: { limit: 0, name: '', page: 1, subdivision_id: subdivisionId },
    options: { enabled },
  });

  return {
    ...query,
    warehouses: getItems(query.data?.payload).map(normalizeStorage),
  };
};
