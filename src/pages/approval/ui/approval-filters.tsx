import { useMemo, useState } from 'react';
import { Button, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';

import { useAllWarehouses } from '@entities/location';

import {
  approvalItemTypeOptions,
  approvalOperationOptions,
  approvalStatusOptions,
} from '../model/approval-options';
import type { ApprovalFilters as ApprovalFiltersValues } from '../model/types';

type ApprovalFiltersProps = {
  filters: ApprovalFiltersValues;
  isOpen: boolean;
  onApply: (filters: ApprovalFiltersValues) => void;
  onClick: () => void;
  onClose: () => void;
};

export const ApprovalFilters = ({
  filters,
  isOpen,
  onApply,
  onClick,
  onClose,
}: ApprovalFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const { isFetching, isLoading, warehouses } = useAllWarehouses(isOpen);
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

  const setFilter = (key: keyof ApprovalFiltersValues, value: string | null) => {
    setLocalFilters((current) => ({ ...current, [key]: value ? [value] : [] }));
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
          <Modal.Header title="Фильтрация списка" />
          <Modal.Content className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Статус"
              value={localFilters.status_id[0] || null}
              options={approvalStatusOptions}
              onChange={(value) => setFilter('status_id', value)}
              fullWidth
              proportions="m"
            />
            <Select
              label="Тип операции"
              value={localFilters.operation_type_id[0] || null}
              options={approvalOperationOptions}
              onChange={(value) => setFilter('operation_type_id', value)}
              fullWidth
              proportions="m"
            />
            <Select
              label="Тип товара"
              value={localFilters.item_type_id[0] || null}
              options={approvalItemTypeOptions}
              onChange={(value) => setFilter('item_type_id', value)}
              fullWidth
              proportions="m"
            />
            <Select
              label="Откуда"
              value={localFilters.from_storage_id[0] || null}
              options={warehouseOptions}
              onChange={(value) => setFilter('from_storage_id', value)}
              isLoading={isLoading || isFetching}
              fullWidth
              proportions="m"
            />
            <Select
              label="Куда"
              value={localFilters.to_storage_id[0] || null}
              options={warehouseOptions}
              onChange={(value) => setFilter('to_storage_id', value)}
              isLoading={isLoading || isFetching}
              fullWidth
              proportions="m"
            />
          </Modal.Content>
          <Modal.Actions className="flex justify-end">
            <div className="flex gap-2">
              <Button type="button" variant="outline-neutral" onClick={onClose}>
                Отмена
              </Button>
              <Button type="button" variant="primary" onClick={() => onApply(localFilters)}>
                Применить
              </Button>
            </div>
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
};
