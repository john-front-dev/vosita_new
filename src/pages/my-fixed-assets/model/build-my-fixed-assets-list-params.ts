import type { MyFixedAssetsFilters } from './my-fixed-assets-filters';

export const buildMyFixedAssetsListParams = (
  filters: MyFixedAssetsFilters,
  page: number,
  limit: number,
  searchText?: string,
) => ({
  BUILDING_ID: '',
  CATEGORY_ID: filters.CATEGORY_ID[0] ?? '',
  CITY_ID: '',
  EXPLOITER_ID: filters.EXPLOITER_ID[0] ?? '',
  LIMIT: limit,
  PAGE: page,
  REPAIR: 0,
  RESPONSIBLE_PERSON_ID: '',
  SEARCH_TEXT: searchText ?? '',
  STATUS_ID: 0,
  WAREHOUSE_MANAGER_ID: '',
});
