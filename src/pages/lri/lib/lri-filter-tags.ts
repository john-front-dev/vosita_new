import type { Building, City } from '@entities/location';
import { buildAppliedFilterTags } from '@shared/lib';

import type { LriFilterKey, LriFilters } from '../model/lri-filters';

export const getAppliedLriFilters = (filters: LriFilters, cities: City[], buildings: Building[]) =>
  buildAppliedFilterTags<LriFilterKey>([
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
  ]);
