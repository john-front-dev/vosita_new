export type LriFilterKey = 'CITY_ID' | 'BUILDING_ID';

export type LriFilters = Record<LriFilterKey, string[]>;

export const lriFilterKeys = ['CITY_ID', 'BUILDING_ID'] as const satisfies readonly LriFilterKey[];

export const lriDefaultFilters: LriFilters = {
  CITY_ID: [],
  BUILDING_ID: [],
};
