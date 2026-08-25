import type { Building, City } from '@entities/location';

import type { LriFilterKey, LriFilters } from '../model/lri-filters';

type LriFilterTag = { key: LriFilterKey; label: string };

const getLabelById = <T extends { id: number | string }>(
  records: T[],
  id: string,
  getLabel: (record: T) => string,
) => {
  const record = records.find((item) => String(item.id) === id);

  return record ? getLabel(record) : id;
};

export const getAppliedLriFilters = (
  filters: LriFilters,
  cities: City[],
  buildings: Building[],
): LriFilterTag[] => {
  const cityId = filters.CITY_ID[0];
  const buildingId = filters.BUILDING_ID[0];

  return [
    ...(cityId
      ? [
          {
            key: 'CITY_ID' as const,
            label: `Город: ${getLabelById(cities, cityId, (city) => city.name)}`,
          },
        ]
      : []),
    ...(buildingId
      ? [
          {
            key: 'BUILDING_ID' as const,
            label: `Здание: ${getLabelById(buildings, buildingId, (building) => building.name ?? building.build ?? '')}`,
          },
        ]
      : []),
  ];
};
