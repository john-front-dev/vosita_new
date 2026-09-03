import type { OthersFilters } from './others-filters';

const first = (values: string[]) => values[0] ?? '';

export const buildOthersListParams = (
  filters: OthersFilters,
  page: number,
  limit: number,
  searchText?: string,
) => ({
  building_id: first(filters.BUILDING_ID),
  category_id: first(filters.CATEGORY_ID),
  city_id: first(filters.CITY_ID),
  exploiter_id: first(filters.EXPLOITER_ID),
  limit,
  page,
  repair: Number(first(filters.REPAIR) || 0),
  responsible_person_id: first(filters.RESPONSIBLE_PERSON_ID),
  search_text: searchText ?? '',
  status_id: Number(first(filters.STATUS_ID) || 0),
  warehouse_manager_id: first(filters.WAREHOUSE_MANAGER_ID),
});
