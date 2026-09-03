import { useMemo, useState } from 'react';
import { Button, DatePicker, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';

import { useEmployees } from '@entities/employee';
import {
  getDepartmentName,
  getStorageId,
  getStorageName,
  getSubdivisionName,
  useAllWarehouses,
} from '@entities/location';
import { normalizeSelectValue } from '@shared/lib';

import { historyOperationOptions } from '../model/history-options';
import type { HistoryFilters as HistoryFilterValues } from '../model/types';

type HistoryFiltersProps = {
  filters: HistoryFilterValues;
  isOpen: boolean;
  onApply: (filters: HistoryFilterValues) => void;
  onClick: () => void;
  onClose: () => void;
};

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseDateParam = (value?: string) => {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
};

const toSingleValue = (value: unknown) => {
  const normalizedValue = normalizeSelectValue(value);
  return normalizedValue ? [normalizedValue] : [];
};

const HistoryFiltersModal = ({
  filters,
  onApply,
  onClose,
}: Pick<HistoryFiltersProps, 'filters' | 'onApply' | 'onClose'>) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const warehousesQuery = useAllWarehouses(true);
  const employeesQuery = useEmployees();
  const warehouseOptions = useMemo(
    () =>
      warehousesQuery.warehouses.map((warehouse) => ({
        label:
          [getDepartmentName(warehouse), getSubdivisionName(warehouse), getStorageName(warehouse)]
            .filter(Boolean)
            .join(' / ') || '-',
        value: String(getStorageId(warehouse) ?? ''),
      })),
    [warehousesQuery.warehouses],
  );
  const employeeOptions = useMemo(
    () =>
      employeesQuery.employees.map((employee) => ({
        label: employee.full_name,
        value: String(employee.id),
      })),
    [employeesQuery.employees],
  );

  const setFilter = (key: keyof HistoryFilterValues, value: unknown) => {
    setLocalFilters((current) => ({ ...current, [key]: toSingleValue(value) }));
  };
  const setDate = (key: 'start_date' | 'end_date', date: unknown) => {
    setLocalFilters((current) => ({
      ...current,
      [key]: date instanceof Date ? [formatDateParam(date)] : [],
    }));
  };

  return (
    <Modal
      isOpen
      isCentered
      withCloseButton
      isCloseOutside={false}
      onClose={onClose}
      className="w-170"
    >
      <Modal.Header title="Фильтрация истории" />
      <Modal.Content className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Склад"
          value={localFilters.warehouse_id[0] || null}
          options={warehouseOptions}
          onChange={(value) => setFilter('warehouse_id', value)}
          isLoading={warehousesQuery.isLoading || warehousesQuery.isFetching}
          fullWidth
        />
        <Select
          label="Тип операции"
          value={localFilters.operation_type[0] || null}
          options={[...historyOperationOptions]}
          onChange={(value) => setFilter('operation_type', value)}
          fullWidth
        />
        <Select
          label="Инициатор"
          value={localFilters.initiator[0] || null}
          options={employeeOptions}
          onChange={(value) => setFilter('initiator', value)}
          isLoading={employeesQuery.isLoading || employeesQuery.isFetching}
          fullWidth
        />
        <DatePicker
          label="Дата от"
          values={parseDateParam(localFilters.start_date[0])}
          onDateChange={(date) => setDate('start_date', date)}
          allowTime={false}
          fullWidth
        />
        <DatePicker
          label="Дата до"
          values={parseDateParam(localFilters.end_date[0])}
          onDateChange={(date) => setDate('end_date', date)}
          allowTime={false}
          fullWidth
        />
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-2">
        <Button type="button" variant="outline-neutral" onClick={onClose}>
          Отмена
        </Button>
        <Button type="button" variant="primary" onClick={() => onApply(localFilters)}>
          Применить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export const HistoryFilters = ({
  filters,
  isOpen,
  onApply,
  onClick,
  onClose,
}: HistoryFiltersProps) => (
  <>
    <Button
      type="button"
      variant="outline-neutral"
      size="l"
      leftSection={<OutlineSystemFilterFromLessToMore />}
      onClick={onClick}
    >
      Фильтр
    </Button>
    {isOpen && <HistoryFiltersModal filters={filters} onApply={onApply} onClose={onClose} />}
  </>
);
