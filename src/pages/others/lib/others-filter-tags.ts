import type { Category } from '@entities/category';
import type { Employee } from '@entities/employee';
import type { Building, City } from '@entities/location';
import { buildAppliedFilterTags } from '@shared/lib';

import {
  type OthersFilterKey,
  type OthersFilters,
  othersRepairOptions,
  othersStatusOptions,
} from '../model/others-filters';

type OthersFilterSources = {
  buildings: Building[];
  categories: Category[];
  cities: City[];
  exploiters: Employee[];
  responsiblePeople: Employee[];
  warehouseManagers: Employee[];
};

const employeeOptions = (employees: Employee[]) =>
  employees.map((employee) => ({ label: employee.full_name, value: String(employee.id) }));

export const getAppliedOthersFilters = (
  filters: OthersFilters,
  {
    buildings,
    categories,
    cities,
    exploiters,
    responsiblePeople,
    warehouseManagers,
  }: OthersFilterSources,
) =>
  buildAppliedFilterTags<OthersFilterKey>([
    {
      key: 'WAREHOUSE_MANAGER_ID',
      options: employeeOptions(warehouseManagers),
      title: 'Заведующий складом',
      value: filters.WAREHOUSE_MANAGER_ID[0],
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
      key: 'RESPONSIBLE_PERSON_ID',
      options: employeeOptions(responsiblePeople),
      title: 'Ответственное лицо',
      value: filters.RESPONSIBLE_PERSON_ID[0],
    },
    {
      key: 'EXPLOITER_ID',
      options: employeeOptions(exploiters),
      title: 'Пользователь',
      value: filters.EXPLOITER_ID[0],
    },
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
      key: 'STATUS_ID',
      options: othersStatusOptions,
      title: 'Статус',
      value: filters.STATUS_ID[0],
    },
    {
      key: 'REPAIR',
      options: othersRepairOptions,
      title: 'Статус ремонта',
      value: filters.REPAIR[0],
    },
  ]);
