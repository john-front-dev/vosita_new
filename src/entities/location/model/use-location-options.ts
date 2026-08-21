import { useGetQuery } from '@shared/api';
import { useDebouncedValue } from '@shared/lib';

import { locationEndpoints } from '../api/location-api';
import type { Building, Cabinet, City, LocationListResponse } from './types';

const listFromPayload = <T>(payload: { data?: T[] } | T[] | undefined): T[] =>
  Array.isArray(payload) ? payload : (payload?.data ?? []);

export const useCities = (searchText = '', enabled = true) => {
  const search = useDebouncedValue(searchText);
  const query = useGetQuery<LocationListResponse<City>>({
    queryKey: ['cities', search],
    url: locationEndpoints.cities,
    params: { limit: 0, name: search, page: 1 },
    options: { enabled },
  });
  return { ...query, cities: listFromPayload(query.data?.payload) };
};

export const useBuildings = (cityId?: string, searchText = '', enabled = true) => {
  const search = useDebouncedValue(searchText);
  const query = useGetQuery<LocationListResponse<Building>>({
    queryKey: ['buildings', cityId, search],
    url: locationEndpoints.buildings,
    params: { department_id: cityId ?? '', limit: 0, name: search, page: 1 },
    options: { enabled: enabled && Boolean(cityId) },
  });
  return { ...query, buildings: listFromPayload(query.data?.payload) };
};

export const useCabinets = (buildingId?: string, searchText = '', enabled = true) => {
  const search = useDebouncedValue(searchText);
  const query = useGetQuery<LocationListResponse<Cabinet>>({
    queryKey: ['cabinets', buildingId, search],
    url: locationEndpoints.cabinets,
    params: { limit: 0, name: search, page: 1, subdivision_id: buildingId ?? '' },
    options: { enabled: enabled && Boolean(buildingId) },
  });
  return { ...query, cabinets: listFromPayload(query.data?.payload) };
};
