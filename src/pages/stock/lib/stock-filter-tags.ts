import type { Category } from '@entities/category';
import type { WarehouseManager } from '@entities/employee';
import type { WarehouseLocation } from '@entities/location';
import { buildDepartmentOptions, buildSubdivisionOptions } from '@entities/location';
import { stockAssetFilterStatusLabels } from '@entities/stock-asset';

import type { StockFilterKey, StockFilters } from '../model/types';

type StockFilterTag = {
  id: string;
  key: StockFilterKey;
  label: string;
};

const stockRepairLabels: Record<string, string> = {
  '1': 'В ремонте',
  '2': 'Не в ремонте',
};

const getLocationLabel = (
  value: string | undefined,
  options: Array<{ label: string; value: string }>,
) => {
  if (!value) {
    return null;
  }

  return options.find((option) => option.value === value)?.label ?? value;
};

export const getAppliedStockFilters = (
  filters: StockFilters,
  warehouses: WarehouseLocation[],
  categories: Category[],
  warehouseManagers: WarehouseManager[],
): StockFilterTag[] => {
  const cityId = filters.CITY_ID[0];
  const buildingId = filters.BUILDING_ID[0];
  const categoryId = filters.CATEGORY_ID[0];
  const warehouseManagerId = filters.WAREHOUSE_MANAGER_ID[0];
  const statusId = filters.STATUS_ID[0];
  const repairId = filters.REPAIR[0];
  const cityOptions = buildDepartmentOptions(warehouses);
  const buildingOptions = buildSubdivisionOptions(warehouses, cityId ? [cityId] : []);

  return [
    warehouseManagerId && {
      id: warehouseManagerId,
      key: 'WAREHOUSE_MANAGER_ID' as const,
      label:
        warehouseManagers.find((manager) => manager.user_id === warehouseManagerId)?.user_name ??
        warehouseManagerId,
    },
    categoryId && {
      id: categoryId,
      key: 'CATEGORY_ID' as const,
      label: categories.find((category) => String(category.id) === categoryId)?.name ?? categoryId,
    },
    cityId && {
      id: cityId,
      key: 'CITY_ID' as const,
      label: getLocationLabel(cityId, cityOptions) ?? cityId,
    },
    buildingId && {
      id: buildingId,
      key: 'BUILDING_ID' as const,
      label: getLocationLabel(buildingId, buildingOptions) ?? buildingId,
    },
    statusId && {
      id: statusId,
      key: 'STATUS_ID' as const,
      label: stockAssetFilterStatusLabels[statusId] ?? statusId,
    },
    repairId && {
      id: repairId,
      key: 'REPAIR' as const,
      label: stockRepairLabels[repairId] ?? repairId,
    },
  ].filter(Boolean) as StockFilterTag[];
};
