import {
  type AuthAccess,
  type AuthUser,
  isAccountant,
  isResponsible,
  isWarehouseManager,
} from '@shared/lib';

import { applicationTabs } from '../model/application-tabs';
import type { ApplicationListType } from '../model/types';

const storageTypeToListType: Record<string, ApplicationListType> = {
  MBP: 'mbp',
  OS: 'fixed-assets',
  Other: 'other',
  PAU: 'lri',
  TMZ: 'tmz',
};

export const isResponsibleAndWarehouseManager = (user: AuthUser | null) =>
  isWarehouseManager(user) && isResponsible(user);

export const getAvailableApplicationTabs = (user: AuthUser | null, accesses: AuthAccess[]) => {
  const userStorageTypes = accesses.map((access) => access.storage_type);
  const hasFullAccess =
    (isResponsible(user) && !isWarehouseManager(user)) || isAccountant(accesses);

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
