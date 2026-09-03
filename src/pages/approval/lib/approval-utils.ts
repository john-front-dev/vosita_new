import type { AccessibleWarehouse } from '@entities/location';
import {
  getDepartmentName,
  getStorageId,
  getStorageName,
  getSubdivisionName,
} from '@entities/location';
import { buildAppliedFilterTags } from '@shared/lib';

import {
  approvalItemTypeOptions,
  approvalOperationOptions,
  approvalStatusOptions,
} from '../model/approval-options';
import type { ApprovalFilterKey, ApprovalFilters } from '../model/types';

export const formatApprovalLocation = (...parts: Array<string | undefined>) =>
  parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' / ') || '-';

export const formatApprovalQuantity = (quantity?: number | string | null) => {
  if (quantity === null || quantity === undefined || quantity === '') return '-';
  const number = Number(String(quantity).replace(',', '.'));
  return Number.isNaN(number) ? String(quantity) : number.toFixed(2);
};

export const getApprovalStatusVariant = (statusId: number) => {
  if (statusId === 2) return 'success' as const;
  if (statusId === 3) return 'error' as const;
  if (statusId === 1) return 'warning' as const;
  return 'neutral' as const;
};

const getWarehouseOptions = (warehouses: AccessibleWarehouse[]) =>
  warehouses.map((warehouse) => ({
    label: formatApprovalLocation(
      getDepartmentName(warehouse),
      getSubdivisionName(warehouse),
      getStorageName(warehouse),
    ),
    value: String(getStorageId(warehouse) ?? ''),
  }));

export const getAppliedApprovalFilters = (
  filters: ApprovalFilters,
  warehouses: AccessibleWarehouse[],
) => {
  const warehouseOptions = getWarehouseOptions(warehouses);

  return buildAppliedFilterTags<ApprovalFilterKey>([
    {
      key: 'status_id',
      options: approvalStatusOptions,
      title: 'Статус',
      value: filters.status_id[0],
    },
    {
      key: 'operation_type_id',
      options: approvalOperationOptions,
      title: 'Тип операции',
      value: filters.operation_type_id[0],
    },
    {
      key: 'item_type_id',
      options: approvalItemTypeOptions,
      title: 'Тип товара',
      value: filters.item_type_id[0],
    },
    {
      key: 'from_storage_id',
      options: warehouseOptions,
      title: 'Откуда',
      value: filters.from_storage_id[0],
    },
    {
      key: 'to_storage_id',
      options: warehouseOptions,
      title: 'Куда',
      value: filters.to_storage_id[0],
    },
  ]);
};
