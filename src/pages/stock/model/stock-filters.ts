import type { StockFilterKey, StockFilters } from './types';

export const stockFilterKeys = [
  'WAREHOUSE_MANAGER_ID',
  'CATEGORY_ID',
  'CITY_ID',
  'BUILDING_ID',
  'STATUS_ID',
  'REPAIR',
] as const satisfies readonly StockFilterKey[];

export const stockDefaultFilters: StockFilters = {
  WAREHOUSE_MANAGER_ID: [],
  CATEGORY_ID: [],
  BUILDING_ID: [],
  CITY_ID: [],
  REPAIR: [],
  STATUS_ID: [],
};
