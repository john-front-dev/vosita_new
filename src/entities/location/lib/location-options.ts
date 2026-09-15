import type { LocationOption, WarehouseLocation } from '../model/types';

const getUniqueOptions = (options: LocationOption[]) =>
  options.filter(
    (option, index, array) => array.findIndex((entry) => entry.value === option.value) === index,
  );

export const buildDepartmentOptions = (warehouses: WarehouseLocation[]) =>
  getUniqueOptions(
    warehouses
      .map((warehouse) => ({
        label: warehouse.department_name,
        value: String(warehouse.department_id),
      }))
      .filter((option) => option.label),
  );

export const buildSubdivisionOptions = (
  warehouses: WarehouseLocation[],
  departmentIds: string[],
) =>
  getUniqueOptions(
    warehouses
      .filter((warehouse) => {
        return (
          departmentIds.length === 0 || departmentIds.includes(String(warehouse.department_id))
        );
      })
      .map((warehouse) => ({
        label: warehouse.subdivision_name,
        value: String(warehouse.subdivision_id),
      }))
      .filter((option) => option.label),
  );

export const buildStorageOptions = (
  warehouses: WarehouseLocation[],
  departmentIds: string[],
  subdivisionIds: string[],
) =>
  getUniqueOptions(
    warehouses
      .filter((warehouse) => {
        const isDepartmentAllowed =
          departmentIds.length === 0 ||
          departmentIds.includes(String(warehouse.department_id));
        const isSubdivisionAllowed =
          subdivisionIds.length === 0 ||
          subdivisionIds.includes(String(warehouse.subdivision_id));

        return isDepartmentAllowed && isSubdivisionAllowed;
      })
      .map((warehouse) => ({
        label: warehouse.storage_name,
        value: String(warehouse.storage_id),
      }))
      .filter((option) => option.label),
  );
