export type OthersFilterKey =
  | 'BUILDING_ID'
  | 'CATEGORY_ID'
  | 'CITY_ID'
  | 'EXPLOITER_ID'
  | 'REPAIR'
  | 'RESPONSIBLE_PERSON_ID'
  | 'STATUS_ID'
  | 'WAREHOUSE_MANAGER_ID';

export type OthersFilters = Record<OthersFilterKey, string[]>;

export const othersFilterKeys = [
  'WAREHOUSE_MANAGER_ID',
  'CATEGORY_ID',
  'RESPONSIBLE_PERSON_ID',
  'EXPLOITER_ID',
  'CITY_ID',
  'BUILDING_ID',
  'STATUS_ID',
  'REPAIR',
] as const satisfies readonly OthersFilterKey[];

export const othersDefaultFilters: OthersFilters = {
  BUILDING_ID: [],
  CATEGORY_ID: [],
  CITY_ID: [],
  EXPLOITER_ID: [],
  REPAIR: [],
  RESPONSIBLE_PERSON_ID: [],
  STATUS_ID: [],
  WAREHOUSE_MANAGER_ID: [],
};

export const othersStatusOptions = [
  { label: 'Новые', value: '1' },
  { label: 'В хранении', value: '2' },
  { label: 'В эксплуатации', value: '3' },
];

export const othersRepairOptions = [
  { label: 'В ремонте', value: '1' },
  { label: 'Не в ремонте', value: '2' },
];
