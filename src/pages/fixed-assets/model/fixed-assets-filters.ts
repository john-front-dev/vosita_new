export type FixedAssetsFilterKey =
  | 'BUILDING_ID'
  | 'CABINET_ID'
  | 'CATEGORY_ID'
  | 'CITY_ID'
  | 'IS_INVENTORIED';

export type FixedAssetsFilters = Record<FixedAssetsFilterKey, string[]>;

export const fixedAssetsDefaultFilters: FixedAssetsFilters = {
  BUILDING_ID: [],
  CABINET_ID: [],
  CATEGORY_ID: [],
  CITY_ID: [],
  IS_INVENTORIED: [],
};
