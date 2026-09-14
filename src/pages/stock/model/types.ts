export type StockListType = 'fixed-assets' | 'lri';

export type StockCategory = 1 | 2;

export type StockFilterKey =
  | 'BUILDING_ID'
  | 'CATEGORY_ID'
  | 'CITY_ID'
  | 'REPAIR'
  | 'STATUS_ID'
  | 'WAREHOUSE_MANAGER_ID';

export type StockFilters = Record<StockFilterKey, string[]>;

export type StockTab = {
  label: string;
  storageType: string;
  value: StockListType;
};

export type StockListParams = {
  BUILDING_ID: string;
  CATEGORY: StockCategory;
  CATEGORY_ID: string;
  CITY_ID: string;
  EXPLOITER_ID: string;
  LIMIT: number;
  PAGE: number;
  REPAIR: number;
  RESPONSIBLE_PERSON_ID: string;
  SEARCH_TEXT: string;
  STATUS_ID: number;
  WAREHOUSE_MANAGER_ID: string;
};
