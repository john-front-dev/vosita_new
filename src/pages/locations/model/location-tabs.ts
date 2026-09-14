import type { LocationType } from './types';

export const locationTabs: Array<{ label: string; value: LocationType }> = [
  { label: 'Города', value: 'cities' },
  { label: 'Здания', value: 'buildings' },
  { label: 'Кабинеты', value: 'cabinets' },
  { label: 'Склады', value: 'warehouses' },
];

export const locationTypeLabels: Record<LocationType, { add: string; singular: string }> = {
  cities: { add: 'Добавить город', singular: 'город' },
  buildings: { add: 'Добавить здание', singular: 'здание' },
  cabinets: { add: 'Добавить кабинет', singular: 'кабинет' },
  warehouses: { add: 'Добавить склад', singular: 'склад' },
};
