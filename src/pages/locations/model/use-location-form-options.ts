import { useGetQuery } from '@shared/api';
import { useDebouncedValue } from '@shared/lib';

import { locationsEndpoints } from '../api/locations-api';
import type { BuildingRecord, CityRecord } from './types';

type OptionsResponse<T> = ApiResponse<{ data?: T[] } | T[]>;

type ResponsiblePerson = {
  full_name: string;
  id: number | string;
  user_id?: string;
};

const getItems = <T>(payload?: { data?: T[] } | T[]) =>
  Array.isArray(payload) ? payload : (payload?.data ?? []);

export const useLocationFormCities = (enabled: boolean) => {
  const query = useGetQuery<OptionsResponse<CityRecord>>({
    queryKey: ['location-form-cities'],
    url: locationsEndpoints.cities,
    params: { LIMIT: 0, NAME: '', PAGE: 1 },
    options: { enabled },
  });

  return { ...query, cities: getItems(query.data?.payload) };
};

export const useLocationFormBuildings = (cityId: string, enabled: boolean) => {
  const query = useGetQuery<OptionsResponse<BuildingRecord>>({
    queryKey: ['location-form-buildings', cityId],
    url: locationsEndpoints.buildings,
    params: { DEPARTMENT_ID: cityId, LIMIT: 0, NAME: '', PAGE: 1 },
    options: { enabled: enabled && Boolean(cityId) },
  });

  return { ...query, buildings: getItems(query.data?.payload) };
};

export const useResponsiblePeople = (searchText: string, roleId: string, enabled: boolean) => {
  const search = useDebouncedValue(searchText);
  const query = useGetQuery<OptionsResponse<ResponsiblePerson>>({
    queryKey: ['location-responsible-people', roleId, search],
    url: locationsEndpoints.employees,
    params: {
      ACCESS_ID: '',
      ACTIVE: true,
      LIMIT: 0,
      NAME: search,
      PAGE: 1,
      ROLE_ID: roleId,
    },
    options: { enabled },
  });

  return { ...query, employees: getItems(query.data?.payload) };
};
