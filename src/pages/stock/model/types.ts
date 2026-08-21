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

export type StockRecord = {
  application_id?: string;
  building?: string;
  building_id?: string;
  cabinet?: string;
  category_id?: number;
  city?: string;
  city_id?: string;
  currency?: string;
  date?: number | string;
  exploiter?: string;
  id: number | string;
  inventory_number?: string;
  is_inventoried?: boolean;
  is_repair?: number;
  name: string;
  price?: number;
  qr?: string;
  receipt?: string;
  responsible_person?: string;
  responsible_person_id?: string;
  serial_number?: string;
  status_id?: number;
};

export type StockListPayload = {
  current_page?: number;
  data?: StockRecord[];
  items?: StockRecord[];
  page?: number;
  per_page?: number;
  total_count?: number;
  total_pages?: number;
};

export type StockListResponse = ApiResponse<StockListPayload>;
