import { useMemo } from 'react';
import { Checkbox, SelectMultiple, Typography } from 'alif-ui';

import { type EmployeeLocationAccess, employeeStorageTypeOptions } from '@entities/employee';
import {
  getDepartmentName,
  getStorageId,
  getStorageName,
  getSubdivisionName,
  useAllWarehouses,
} from '@entities/location';

const selectAllWarehousesValue = -1;

type Props = {
  accesses: EmployeeLocationAccess[];
  disabled?: boolean;
  isStorageTypeLocked?: boolean;
  onChange: (accesses: EmployeeLocationAccess[]) => void;
};

export const EmployeeWarehouseAccessSettings = ({
  accesses,
  disabled = false,
  isStorageTypeLocked = false,
  onChange,
}: Props) => {
  const warehousesQuery = useAllWarehouses(true);
  const warehouses = useMemo(
    () =>
      warehousesQuery.warehouses
        .map((warehouse) => ({
          id: getStorageId(warehouse),
          label: [
            getDepartmentName(warehouse),
            getSubdivisionName(warehouse),
            getStorageName(warehouse),
          ]
            .filter(Boolean)
            .join(' / '),
        }))
        .filter((warehouse): warehouse is { id: number; label: string } =>
          Boolean(warehouse.id && warehouse.label),
        ),
    [warehousesQuery.warehouses],
  );
  const toggleStorageType = (storageType: string) => {
    onChange(
      accesses.some((access) => access.storage_type === storageType)
        ? accesses.filter((access) => access.storage_type !== storageType)
        : [...accesses, { storage_type: storageType, storages_ids: [] }],
    );
  };
  const setWarehouses = (storageType: string, warehouseIds: number[]) => {
    onChange(
      accesses.map((access) =>
        access.storage_type !== storageType ? access : { ...access, storages_ids: warehouseIds },
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4 border-t border-(--color-border-default) pt-5">
      {!isStorageTypeLocked && (
        <>
          <Typography category="body" proportions="mStrong">
            Типы разделов
          </Typography>
          <div className="flex flex-col gap-3">
            {employeeStorageTypeOptions.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={accesses.some((access) => access.storage_type === option.value)}
                disabled={disabled}
                onChange={() => toggleStorageType(option.value)}
              />
            ))}
          </div>
        </>
      )}
      {accesses.map((access) => (
        <SelectMultiple
          key={access.storage_type}
          label={
            access.storage_type === 'Accountant'
              ? 'Склады бухгалтера'
              : `Склады для ${
                  employeeStorageTypeOptions.find((option) => option.value === access.storage_type)
                    ?.label ?? access.storage_type
                }`
          }
          values={access.storages_ids}
          options={[
            {
              label: access.storages_ids.length === warehouses.length ? 'Снять все' : 'Выбрать все',
              value: selectAllWarehousesValue,
            },
            ...warehouses.map((warehouse) => ({
              label: warehouse.label,
              value: warehouse.id,
            })),
          ]}
          disabled={disabled}
          isLoading={warehousesQuery.isLoading || warehousesQuery.isFetching}
          onChange={(values) => {
            const warehouseIds = values.map(Number);

            if (warehouseIds.includes(selectAllWarehousesValue)) {
              setWarehouses(
                access.storage_type,
                access.storages_ids.length === warehouses.length
                  ? []
                  : warehouses.map((warehouse) => warehouse.id),
              );
              return;
            }

            setWarehouses(access.storage_type, warehouseIds);
          }}
          isStayOpenAfterSelection
          fullWidth
        />
      ))}
      {!accesses.length && (
        <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
          Выберите тип раздела, чтобы назначить склады.
        </Typography>
      )}
    </div>
  );
};
