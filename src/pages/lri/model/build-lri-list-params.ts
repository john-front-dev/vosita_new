import type { LriFilters } from './lri-filters';

export const buildLriListParams = (
  filters: LriFilters,
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
  CATEGORY_ID: '',
  CITY_ID: filters.CITY_ID[0] ?? '',
  REPAIR: 0,
  STATUS_ID: 0,
  WAREHOUSE_MANAGER_ID: '',
  CATEGORY: 2,
});
