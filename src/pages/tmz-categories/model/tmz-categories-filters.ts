export type TmzCategoriesFilterKey =
  | 'BUILDING_ID'
  | 'CATEGORY_ID'
  | 'CITY_ID'
  | 'WITH_ZEROS';

export type TmzCategoriesFilters = Record<TmzCategoriesFilterKey, string[]>;

export const tmzCategoriesDefaultFilters: TmzCategoriesFilters = {
  BUILDING_ID: [],
  CATEGORY_ID: [],
  CITY_ID: [],
  WITH_ZEROS: [],
};
