import { useGetQuery } from '@shared/api';

import { locationsEndpoints } from '../api/locations-api';
import type { ItemType } from './types';

export const useItemTypes = (enabled: boolean) => {
  const query = useGetQuery<ApiResponse<ItemType[]>>({
    queryKey: ['location-item-types'],
    url: locationsEndpoints.itemTypes,
    options: { enabled },
  });

  return { ...query, itemTypes: query.data?.payload ?? [] };
};
