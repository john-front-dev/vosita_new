import type {
  EmployeeLocationAccess,
  EmployeeWarehouseAccessResponse,
} from '@entities/employee';

const ACCOUNTANT_ROLE_ID = 7;
const WAREHOUSE_ACCESS_ROLE_IDS = new Set([1, 2, 3, ACCOUNTANT_ROLE_ID]);
const ACCOUNTANT_STORAGE_TYPE = 'Accountant';

type EmployeePermissions =
  EmployeeWarehouseAccessResponse['payload']['employee_permissions'];

export const supportsWarehouseAccess = (roleId: number) =>
  WAREHOUSE_ACCESS_ROLE_IDS.has(roleId);

export const getInitialWarehouseAccesses = (
  roleId: number,
  permissions: EmployeePermissions = [],
): EmployeeLocationAccess[] => {
  const accesses = permissions.map(({ storage_type, storages }) => ({
    storage_type,
    storages_ids: storages.map(({ id }) => id),
  }));

  if (roleId !== ACCOUNTANT_ROLE_ID) {
    return accesses.filter(({ storage_type }) => storage_type !== ACCOUNTANT_STORAGE_TYPE);
  }

  const accountantAccess = accesses.find(
    ({ storage_type }) => storage_type === ACCOUNTANT_STORAGE_TYPE,
  );

  return [{
    storage_type: ACCOUNTANT_STORAGE_TYPE,
    storages_ids: accountantAccess?.storages_ids ?? [],
  }];
};

export const changeWarehouseAccessRole = (
  roleId: number,
  accesses: EmployeeLocationAccess[],
): EmployeeLocationAccess[] => {
  if (roleId === ACCOUNTANT_ROLE_ID) {
    const accountantAccess = accesses.find(
      ({ storage_type }) => storage_type === ACCOUNTANT_STORAGE_TYPE,
    );

    return [{
      storage_type: ACCOUNTANT_STORAGE_TYPE,
      storages_ids: accountantAccess?.storages_ids ?? [],
    }];
  }

  return accesses.filter(({ storage_type }) => storage_type !== ACCOUNTANT_STORAGE_TYPE);
};

export const isWarehouseAccessComplete = (
  roleId: number,
  accesses: EmployeeLocationAccess[],
) => {
  if (!supportsWarehouseAccess(roleId)) return true;
  if (roleId === ACCOUNTANT_ROLE_ID) {
    const [accountantAccess] = accesses;
    return (
      accesses.length === 1 &&
      accountantAccess.storage_type === ACCOUNTANT_STORAGE_TYPE &&
      accountantAccess.storages_ids.length > 0
    );
  }

  return accesses.length > 0 && accesses.every(({ storages_ids }) => storages_ids.length > 0);
};
