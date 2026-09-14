import { useGetQuery } from '@shared/api';

import { locationsEndpoints } from '../api/locations-api';
import type { LocationListResponse, LocationRecord, LocationType } from './types';

type UseLocationsListParams = {
  limit: number;
  page: number;
  searchText: string;
  type: LocationType;
};

export const useLocationsList = ({ limit, page, searchText, type }: UseLocationsListParams) => {
  const isWarehouses = type === 'warehouses';
  const params = isWarehouses
    ? { limit, name: searchText, page }
    : { LIMIT: limit, NAME: searchText, PAGE: page };
  const query = useGetQuery<LocationListResponse<LocationRecord>>({
    queryKey: ['locations-list', type],
    url: locationsEndpoints[type],
    params,
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? payload?.items ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
