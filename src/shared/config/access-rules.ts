import type { AccessRule } from '@shared/lib';

export const accessRules = {
  approval: {
    roles: ['accountant'],
  },
  fixedAssets: {
    roles: ['responsible', 'accountant'],
    storageTypes: ['OS'],
  },
  history: {
    roles: ['responsible', 'warehouseManager', 'accountant'],
  },
  lri: {
    roles: ['responsible', 'accountant'],
    storageTypes: ['PAU'],
  },
  mbp: {
    roles: ['responsible', 'accountant'],
    storageTypes: ['MBP'],
  },
  request: {
    roles: ['responsible', 'warehouseManager', 'accountant'],
  },
  reports: {
    disabled: true,
  },
  responsibleOrAccountant: {
    roles: ['responsible', 'accountant'],
  },
  tmz: {
    roles: ['responsible', 'accountant'],
    storageTypes: ['TMZ'],
  },
  warehouseData: {
    roles: ['responsible', 'accountant'],
    storageTypes: ['OS', 'PAU'],
  },
} satisfies Record<string, AccessRule>;
