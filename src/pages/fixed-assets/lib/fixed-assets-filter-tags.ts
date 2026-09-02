import type { Category } from '@entities/category';
import type { Building, Cabinet, City } from '@entities/location';
import { buildAppliedFilterTags } from '@shared/lib';

import type { FixedAssetsFilterKey, FixedAssetsFilters } from '../model/fixed-assets-filters';

export const getAppliedFixedAssetsFilters = (
  filters: FixedAssetsFilters,
  cities: City[],
  buildings: Building[],
  cabinets: Cabinet[],
  categories: Category[],
) =>
  buildAppliedFilterTags<FixedAssetsFilterKey>([
    {
      key: 'CITY_ID',
      options: cities.map((city) => ({ label: city.name, value: String(city.id) })),
      title: 'Город',
      value: filters.CITY_ID[0],
    },
    {
      key: 'BUILDING_ID',
      options: buildings.map((building) => ({
        label: building.name ?? building.build ?? '',
        value: String(building.id),
      })),
      title: 'Здание',
      value: filters.BUILDING_ID[0],
    },
    {
      key: 'CATEGORY_ID',
      options: categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
      title: 'Категория',
      value: filters.CATEGORY_ID[0],
    },
    {
      key: 'CABINET_ID',
      options: cabinets.map((cabinet) => ({ label: cabinet.room, value: String(cabinet.id) })),
      title: 'Кабинет',
      value: filters.CABINET_ID[0],
    },
    {
      key: 'IS_INVENTORIED',
      options: [
        { label: 'Да', value: 'true' },
        { label: 'Нет', value: 'false' },
      ],
      title: 'Инвентаризирован',
      value: filters.IS_INVENTORIED[0],
    },
  ]);
