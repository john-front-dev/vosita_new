import {
  buildDepartmentOptions,
  buildStorageOptions,
  buildSubdivisionOptions,
  type WarehouseLocation,
} from '@entities/location';

import type { ApplicationFilterKey, ApplicationFilters } from '../model/types';

type AppliedApplicationFilter = {
  id: string;
  key: ApplicationFilterKey;
  label: string;
};

const getLabelsByValue = (options: Array<{ label: string; value: string }>) =>
  new Map(options.map((option) => [option.value, option.label]));

const buildAppliedFilters = (
  key: ApplicationFilterKey,
  title: string,
  values: string[],
  labels: Map<string, string>,
) =>
  values.map((id) => ({
    id,
    key,
    label: `${title}: ${labels.get(id) ?? id}`,
  }));

export const getAppliedApplicationFilters = (
  filters: ApplicationFilters,
  warehouses: WarehouseLocation[],
): AppliedApplicationFilter[] => {
  const departmentLabels = getLabelsByValue(buildDepartmentOptions(warehouses));
  const subdivisionLabels = getLabelsByValue(
    buildSubdivisionOptions(warehouses, filters.DEPARTMENT_ID),
  );
  const storageLabels = getLabelsByValue(
    buildStorageOptions(warehouses, filters.DEPARTMENT_ID, filters.SUBDIVISION_ID),
  );

  return [
    ...buildAppliedFilters('DEPARTMENT_ID', 'Отдел', filters.DEPARTMENT_ID, departmentLabels),
    ...buildAppliedFilters('SUBDIVISION_ID', 'Здание', filters.SUBDIVISION_ID, subdivisionLabels),
    ...buildAppliedFilters('STORAGE_ID', 'Склад', filters.STORAGE_ID, storageLabels),
  ];
};
