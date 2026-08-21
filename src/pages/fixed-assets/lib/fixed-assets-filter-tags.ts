import type { Category } from '@entities/category';
import type { Building, Cabinet, City } from '@entities/location';

import type { FixedAssetsFilterKey, FixedAssetsFilters } from '../model/fixed-assets-filters';

type AppliedFixedAssetsFilter = {
  key: FixedAssetsFilterKey;
  label: string;
};

const getLabelById = <T extends { id: number | string }>(
  records: T[],
  id: string,
  getLabel: (record: T) => string,
) => {
  const record = records.find((item) => String(item.id) === id);

  return record ? getLabel(record) || id : id;
};

export const getAppliedFixedAssetsFilters = (
  filters: FixedAssetsFilters,
  cities: City[],
  buildings: Building[],
  cabinets: Cabinet[],
  categories: Category[],
): AppliedFixedAssetsFilter[] => {
  const cityId = filters.CITY_ID[0];
  const buildingId = filters.BUILDING_ID[0];
  const cabinetId = filters.CABINET_ID[0];
  const categoryId = filters.CATEGORY_ID[0];
  const isInventoried = filters.IS_INVENTORIED[0];

  return [
    ...(cityId
      ? [{ key: 'CITY_ID' as const, label: `Город: ${getLabelById(cities, cityId, (city) => city.name)}` }]
      : []),
    ...(buildingId
      ? [
          {
            key: 'BUILDING_ID' as const,
            label: `Здание: ${getLabelById(buildings, buildingId, (building) => building.name ?? building.build ?? '')}`,
          },
        ]
      : []),
    ...(categoryId
      ? [
          {
            key: 'CATEGORY_ID' as const,
            label: `Категория: ${getLabelById(categories, categoryId, (category) => category.name)}`,
          },
        ]
      : []),
    ...(cabinetId
      ? [
          {
            key: 'CABINET_ID' as const,
            label: `Кабинет: ${getLabelById(cabinets, cabinetId, (cabinet) => cabinet.room)}`,
          },
        ]
      : []),
    ...(isInventoried
      ? [
          {
            key: 'IS_INVENTORIED' as const,
            label: `Инвентаризирован: ${isInventoried === 'true' ? 'Да' : 'Нет'}`,
          },
        ]
      : []),
  ];
};
