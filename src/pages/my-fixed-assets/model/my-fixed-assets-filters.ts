export const myFixedAssetsFilterKeys = ['EXPLOITER_ID', 'CATEGORY_ID'] as const;

export type MyFixedAssetsFilterKey = (typeof myFixedAssetsFilterKeys)[number];
export type MyFixedAssetsFilters = Record<MyFixedAssetsFilterKey, string[]>;

export const myFixedAssetsDefaultFilters: MyFixedAssetsFilters = {
  CATEGORY_ID: [],
  EXPLOITER_ID: [],
};
