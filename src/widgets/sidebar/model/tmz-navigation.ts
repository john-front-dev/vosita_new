import { createElement } from 'react';
import { OutlineSystemHome } from 'alif-ui';

import type { WarehouseLocation } from '@entities/location';
import { routes } from '@shared/config';
import {
  type AuthAccess,
  type AuthUser,
  isAccountant,
  isResponsible,
  isWarehouseManager,
} from '@shared/lib';

import type { SidebarNavItem } from './navigation';

type WarehouseSource = {
  id: number;
  name: string;
};

const toNavigationItem = (warehouse: WarehouseSource): SidebarNavItem | null => {
  if (!warehouse.id || !warehouse.name) return null;

  return {
    icon: createElement(OutlineSystemHome),
    path: `${routes.inventory}/${warehouse.id}`,
    title: warehouse.name,
  };
};

export const getTmzNavigationItems = (
  user: AuthUser | null,
  accesses: AuthAccess[],
  allWarehouses: WarehouseLocation[],
): SidebarNavItem[] => {
  if (!user) return [];

  const warehouses: WarehouseSource[] =
    isResponsible(user) && !isWarehouseManager(user)
      ? allWarehouses.map((warehouse) => ({
          id: warehouse.storage_id,
          name: warehouse.storage_name,
        }))
      : isAccountant(accesses)
        ? accesses.flatMap((access) =>
            access.storage_type === 'Accountant' ? access.storages : [],
          )
        : (accesses.find((access) => access.storage_type === 'TMZ')?.storages ?? []);
  const uniqueItems = new Map<string, SidebarNavItem>();

  warehouses.forEach((warehouse) => {
    const item = toNavigationItem(warehouse);
    if (item) uniqueItems.set(item.path, item);
  });

  return [...uniqueItems.values()];
};
