import { routes } from '@shared/config';

import type { AuthAccess, AuthUser } from './auth-storage';

export type AccessRole = 'responsible' | 'warehouseManager' | 'accountant';

export type AccessRule = {
  disabled?: boolean;
  roles?: AccessRole[];
  storageTypes?: string[];
};

export const isResponsible = (user: AuthUser | null) => Boolean(user?.is_responsible_person);

export const isWarehouseManager = (user: AuthUser | null) => Boolean(user?.is_warehouse_manager);

export const isAccountant = (accesses: AuthAccess[]) =>
  accesses.some((access) => access.storage_type === 'Accountant');

const hasRole = (role: AccessRole, user: AuthUser, accesses: AuthAccess[]) => {
  const roleMap: Record<AccessRole, boolean> = {
    responsible: isResponsible(user),
    warehouseManager: isWarehouseManager(user),
    accountant: isAccountant(accesses),
  };

  return roleMap[role];
};

const hasStorageType = (storageType: string, accesses: AuthAccess[]) =>
  accesses.some((access) => access.storage_type === storageType);

export const canAccess = (user: AuthUser | null, accesses: AuthAccess[], rule?: AccessRule) => {
  if (!user) {
    return false;
  }

  if (rule?.disabled) {
    return false;
  }

  if (!rule?.roles?.length && !rule?.storageTypes?.length) {
    return true;
  }

  const hasAllowedRole = rule.roles?.some((role) => hasRole(role, user, accesses)) ?? false;
  const hasAllowedStorage =
    rule.storageTypes?.some((storageType) => hasStorageType(storageType, accesses)) ?? false;

  return hasAllowedRole || hasAllowedStorage;
};

export const getDefaultAuthorizedPath = (user: AuthUser | null, accesses: AuthAccess[]) => {
  if (!user) {
    return routes.login;
  }

  if (isResponsible(user) || isWarehouseManager(user) || isAccountant(accesses)) {
    return routes.applications;
  }

  return routes.fixedAssetsMine;
};
