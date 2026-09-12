import { employeeAccessOptions, employeeRoleOptions } from '@entities/employee';

export { employeeAccessOptions, employeeRoleOptions };

export const employeesFilterKeys = ['role_id', 'access_id'] as const;
export type EmployeesFilterKey = (typeof employeesFilterKeys)[number];
export type EmployeesFilters = Record<EmployeesFilterKey, string[]>;

export const employeesDefaultFilters: EmployeesFilters = {
  access_id: employeeAccessOptions.map((option) => option.value),
  role_id: employeeRoleOptions.map((option) => option.value),
};
