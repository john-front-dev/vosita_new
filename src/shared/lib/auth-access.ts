import { routes } from '@shared/config';

import type { AuthAccess, AuthUser } from './auth-storage';

export type AccessRole = 'responsible' | 'warehouseManager' | 'accountant';

export type AccessRule = {
  disabled?: boolean;
  roles?: AccessRole[];
  storageTypes?: string[];
};

const isAccountant = (accesses: AuthAccess[]) => accesses[0]?.storage_type === 'Accountant';

const hasRole = (role: AccessRole, user: AuthUser, accesses: AuthAccess[]) => {
  const roleMap: Record<AccessRole, boolean> = {
    responsible: Boolean(user.is_responsible_person),
    warehouseManager: Boolean(user.is_warehouse_manager),
    accountant: isAccountant(accesses),
  };

  return roleMap[role];
};

const hasStorageType = (storageType: string, accesses: AuthAccess[]) =>
  accesses.some((access) => access.storage_type === storageType);

export function canAccess(user: AuthUser | null, accesses: AuthAccess[], rule?: AccessRule) {
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
}

export function getDefaultAuthorizedPath(user: AuthUser | null, accesses: AuthAccess[]) {
  if (!user) {
    return routes.login;
  }

  if (user.is_responsible_person || user.is_warehouse_manager || isAccountant(accesses)) {
    return routes.applications;
  }

  return routes.fixedAssetsMine;
}
