import {
  type AuthAccess,
  type AuthUser,
  isAccountant,
  isResponsible,
  isWarehouseManager,
} from '@shared/lib';

import type { StockListType, StockTab } from './types';

export const stockTabs: StockTab[] = [
  {
    label: 'ОС',
    storageType: 'OS',
    value: 'fixed-assets',
  },
  {
    label: 'ПАУ',
    storageType: 'PAU',
    value: 'lri',
  },
];

const stockListTypes = stockTabs.map((tab) => tab.value);

const hasFullAccess = (user: AuthUser | null, accesses: AuthAccess[]) =>
  (isResponsible(user) && !isWarehouseManager(user)) || isAccountant(accesses);

export const getAvailableStockTabs = (user: AuthUser | null, accesses: AuthAccess[]) => {
  if (hasFullAccess(user, accesses)) {
    return stockTabs;
  }

  const userStorageTypes = new Set(accesses.map((access) => access.storage_type));

  return stockTabs.filter((tab) => userStorageTypes.has(tab.storageType));
};

export const getDefaultStockListType = (
  user: AuthUser | null,
  accesses: AuthAccess[],
): StockListType => {
  const availableTabs = getAvailableStockTabs(user, accesses);

  if (availableTabs.some((tab) => tab.value === 'fixed-assets')) {
    return 'fixed-assets';
  }

  return availableTabs[0]?.value ?? 'fixed-assets';
};

export const isStockListType = (value: string | null): value is StockListType =>
  stockListTypes.some((type) => type === value);
