import type { AccessibleWarehouse } from '@entities/location';
import { buildDepartmentOptions, buildSubdivisionOptions } from '@entities/location';

import type { StockFilterKey, StockFilters } from '../model/types';

type StockFilterTag = {
  id: string;
  key: StockFilterKey;
  label: string;
};

const stockStatusLabels: Record<string, string> = {
  '1': 'Новые',
  '2': 'В хранении',
  '19': 'В ожидании принятия',
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
  warehouses: AccessibleWarehouse[],
): StockFilterTag[] => {
  const cityId = filters.CITY_ID[0];
  const buildingId = filters.BUILDING_ID[0];
  const statusId = filters.STATUS_ID[0];
  const repairId = filters.REPAIR[0];
  const cityOptions = buildDepartmentOptions(warehouses);
  const buildingOptions = buildSubdivisionOptions(warehouses, cityId ? [cityId] : []);

  return [
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
      label: stockStatusLabels[statusId] ?? statusId,
    },
    repairId && {
      id: repairId,
      key: 'REPAIR' as const,
      label: stockRepairLabels[repairId] ?? repairId,
    },
  ].filter(Boolean) as StockFilterTag[];
};
