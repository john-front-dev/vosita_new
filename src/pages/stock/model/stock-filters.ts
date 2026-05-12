import type { StockFilterKey, StockFilters } from './types';

export const stockFilterKeys =
  ['CITY_ID', 'BUILDING_ID', 'STATUS_ID', 'REPAIR'] as const satisfies readonly StockFilterKey[];

export const stockDefaultFilters: StockFilters = {
  BUILDING_ID: [],
  CITY_ID: [],
  REPAIR: [],
  STATUS_ID: [],
};
