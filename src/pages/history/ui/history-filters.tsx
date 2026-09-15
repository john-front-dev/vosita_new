import { useMemo, useState } from 'react';
import { Button, DatePicker, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';

import { useEmployees } from '@entities/employee';
import { useAllWarehouses } from '@entities/location';
import { formatDateOnly, normalizeSelectValue, parseDateOnly } from '@shared/lib';

import { historyOperationOptions } from '../model/history-options';
import type { HistoryFilters as HistoryFilterValues } from '../model/types';

type HistoryFiltersProps = {
  filters: HistoryFilterValues;
  isOpen: boolean;
  onApply: (filters: HistoryFilterValues) => void;
  onClick: () => void;
  onClose: () => void;
};

const toSingleValue = (value: unknown) => {
  const normalizedValue = normalizeSelectValue(value);
  return normalizedValue ? [normalizedValue] : [];
};

export const HistoryFilters = ({
  filters,
  isOpen,
  onApply,
  onClick,
  onClose,
}: HistoryFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const {
    isFetching: isWarehousesFetching,
    isLoading: isWarehousesLoading,
    warehouses,
  } = useAllWarehouses(isOpen);
  const {
    employees,
    isFetching: isEmployeesFetching,
    isLoading: isEmployeesLoading,
  } = useEmployees('', isOpen);
  const warehouseOptions = useMemo(
    () =>
      warehouses.map((warehouse) => ({
        label:
          [warehouse.department_name, warehouse.subdivision_name, warehouse.storage_name]
            .filter(Boolean)
            .join(' / ') || '-',
        value: String(warehouse.storage_id),
      })),
    [warehouses],
  );
  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        label: employee.full_name,
        value: String(employee.id),
      })),
    [employees],
  );

  const setFilter = (key: keyof HistoryFilterValues, value: unknown) => {
    setLocalFilters((current) => ({ ...current, [key]: toSingleValue(value) }));
  };
  const setDate = (key: 'start_date' | 'end_date', date: unknown) => {
    setLocalFilters((current) => ({
      ...current,
      [key]: date instanceof Date ? [formatDateOnly(date)] : [],
    }));
  };

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="l"
        leftSection={<OutlineSystemFilterFromLessToMore />}
        onClick={() => {
          setLocalFilters(filters);
          onClick();
        }}
      >
        Фильтр
      </Button>
      {isOpen && (
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
              isLoading={isWarehousesLoading || isWarehousesFetching}
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
              isLoading={isEmployeesLoading || isEmployeesFetching}
              fullWidth
            />
            <DatePicker
              label="Дата от"
              values={parseDateOnly(localFilters.start_date[0])}
              onDateChange={(date) => setDate('start_date', date)}
              allowTime={false}
              fullWidth
            />
            <DatePicker
              label="Дата до"
              values={parseDateOnly(localFilters.end_date[0])}
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
      )}
    </>
  );
};
