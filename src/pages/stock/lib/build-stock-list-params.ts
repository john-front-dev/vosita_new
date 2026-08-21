import type { StockFilters, StockListParams, StockListType } from '../model/types';

const stockTypeCategoryMap: Record<StockListType, 1 | 2> = {
  'fixed-assets': 1,
  lri: 2,
};

const getFirstFilterValue = (values: string[] | undefined) => values?.[0] ?? '';

export const buildStockListParams = ({
  filters,
  limit,
  page,
  searchText,
  type,
}: {
  filters: StockFilters;
  limit: number;
  page: number;
  searchText?: string;
  type: StockListType;
}): StockListParams => ({
  BUILDING_ID: getFirstFilterValue(filters.BUILDING_ID),
  CATEGORY: stockTypeCategoryMap[type],
  CATEGORY_ID: getFirstFilterValue(filters.CATEGORY_ID),
  CITY_ID: getFirstFilterValue(filters.CITY_ID),
  EXPLOITER_ID: '',
  LIMIT: limit,
  PAGE: page,
  REPAIR: Number(getFirstFilterValue(filters.REPAIR) || '0'),
  RESPONSIBLE_PERSON_ID: '',
  SEARCH_TEXT: searchText ?? '',
  STATUS_ID: Number(getFirstFilterValue(filters.STATUS_ID) || '4'),
  WAREHOUSE_MANAGER_ID: getFirstFilterValue(filters.WAREHOUSE_MANAGER_ID),
});
