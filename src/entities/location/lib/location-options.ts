import type { AccessibleWarehouse, LocationOption } from '../model/types';

const getUniqueOptions = (options: LocationOption[]) =>
  options.filter(
    (option, index, array) =>
      array.findIndex((entry) => entry.value === option.value) === index,
  );

const hasValue = (value: number | string | undefined): value is number | string =>
  value !== undefined && value !== '';

export const getDepartmentId = (warehouse: AccessibleWarehouse) =>
  warehouse.dep_id ?? warehouse.department_id;

export const getDepartmentName = (warehouse: AccessibleWarehouse) =>
  warehouse.dep_name ?? warehouse.department_name;

export const getSubdivisionId = (warehouse: AccessibleWarehouse) =>
  warehouse.sub_id ?? warehouse.subdivision_id;

export const getSubdivisionName = (warehouse: AccessibleWarehouse) =>
  warehouse.sub_name ?? warehouse.subdivision_name;

export const getStorageId = (warehouse: AccessibleWarehouse) =>
  warehouse.storage_id ?? warehouse.id;

export const getStorageName = (warehouse: AccessibleWarehouse) =>
  warehouse.storage_name ?? warehouse.name;

export const buildDepartmentOptions = (warehouses: AccessibleWarehouse[]) =>
  getUniqueOptions(
    warehouses
      .map((warehouse) => ({
        label: getDepartmentName(warehouse) ?? '',
        value: String(getDepartmentId(warehouse) ?? ''),
      }))
      .filter((option) => hasValue(option.value) && option.label),
  );

export const buildSubdivisionOptions = (
  warehouses: AccessibleWarehouse[],
  departmentIds: string[],
) =>
  getUniqueOptions(
    warehouses
      .filter((warehouse) => {
        const departmentId = getDepartmentId(warehouse);

        return departmentIds.length === 0 || departmentIds.includes(String(departmentId));
      })
      .map((warehouse) => ({
        label: getSubdivisionName(warehouse) ?? '',
        value: String(getSubdivisionId(warehouse) ?? ''),
      }))
      .filter((option) => hasValue(option.value) && option.label),
  );

export const buildStorageOptions = (
  warehouses: AccessibleWarehouse[],
  departmentIds: string[],
  subdivisionIds: string[],
) =>
  getUniqueOptions(
    warehouses
      .filter((warehouse) => {
        const departmentId = getDepartmentId(warehouse);
        const subdivisionId = getSubdivisionId(warehouse);
        const isDepartmentAllowed =
          departmentIds.length === 0 || departmentIds.includes(String(departmentId));
        const isSubdivisionAllowed =
          subdivisionIds.length === 0 || subdivisionIds.includes(String(subdivisionId));

        return isDepartmentAllowed && isSubdivisionAllowed;
      })
      .map((warehouse) => ({
        label: getStorageName(warehouse) ?? '',
        value: String(getStorageId(warehouse) ?? ''),
      }))
      .filter((option) => hasValue(option.value) && option.label),
  );
