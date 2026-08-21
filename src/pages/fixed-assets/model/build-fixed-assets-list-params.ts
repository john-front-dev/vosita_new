import type { FixedAssetsFilters } from './fixed-assets-filters';

export const buildFixedAssetsListParams = (
  filters: FixedAssetsFilters,
  page: number,
  limit: number,
  searchText?: string,
) => ({
  PAGE: page,
  SEARCH_TEXT: searchText ?? '',
  LIMIT: limit,
  EXPLOITER_ID: '',
  RESPONSIBLE_PERSON_ID: '',
  BUILDING_ID: filters.BUILDING_ID[0] ?? '',
  ROOM_ID: filters.CABINET_ID[0] ?? '',
  CATEGORY_ID: filters.CATEGORY_ID[0] ?? '',
  CITY_ID: filters.CITY_ID[0] ?? '',
  REPAIR: 0,
  STATUS_ID: 0,
  WAREHOUSE_MANAGER_ID: '',
  IS_INVENTORIED: filters.IS_INVENTORIED[0] ?? 'undefined',
  CATEGORY: 1,
});
