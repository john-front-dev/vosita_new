import type { AuthAccess, AuthUser } from '@shared/lib';

import { applicationTabs } from '../model/application-tabs';
import type { ApplicationListType } from '../model/types';

const storageTypeToListType: Record<string, ApplicationListType> = {
  MBP: 'mbp',
  OS: 'fixed-assets',
  Other: 'other',
  PAU: 'lri',
  TMZ: 'tmz',
};

export const isAccountant = (accesses: AuthAccess[]) => accesses[0]?.storage_type === 'Accountant';

export const isResponsibleAndWarehouseManager = (user: AuthUser | null) =>
  Boolean(user?.is_warehouse_manager && user.is_responsible_person);

export const getAvailableApplicationTabs = (user: AuthUser | null, accesses: AuthAccess[]) => {
  const userStorageTypes = accesses.map((access) => access.storage_type);
  const hasFullAccess =
    Boolean(user?.is_responsible_person && !user.is_warehouse_manager) || isAccountant(accesses);

  return applicationTabs.filter((tab) => {
    if (hasFullAccess || !isResponsibleAndWarehouseManager(user)) {
      return true;
    }

    return userStorageTypes.includes(tab.storageType);
  });
};

export const getDefaultApplicationListType = (
  user: AuthUser | null,
  accesses: AuthAccess[],
): ApplicationListType => {
  const availableTabs = getAvailableApplicationTabs(user, accesses);

  if (availableTabs.some((tab) => tab.value === 'fixed-assets')) {
    return 'fixed-assets';
  }

  const firstFromAccess = accesses
    .map((access) => storageTypeToListType[access.storage_type])
    .find(Boolean);

  return firstFromAccess ?? availableTabs[0]?.value ?? 'fixed-assets';
};

export const isApplicationListType = (value: string | null): value is ApplicationListType =>
  applicationTabs.some((tab) => tab.value === value);
