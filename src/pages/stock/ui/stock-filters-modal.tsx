import { useEffect, useMemo, useState } from 'react';
import { Button, Modal, Select } from 'alif-ui';

import {
  type AccessibleWarehouse,
  buildDepartmentOptions,
  buildSubdivisionOptions,
} from '@entities/location';

import type { StockFilters } from '../model/types';

type StockFiltersModalProps = {
  filters: StockFilters;
  isLoading: boolean;
  isOpen: boolean;
  onApply: (filters: StockFilters) => void;
  onClose: () => void;
  warehouses: AccessibleWarehouse[];
};

const stockStatusOptions = [
  { label: 'Новые', value: '1' },
  { label: 'В хранении', value: '2' },
  { label: 'В ожидании принятия', value: '19' },
];

const stockRepairOptions = [
  { label: 'В ремонте', value: '1' },
  { label: 'Не в ремонте', value: '2' },
];

const normalizeSelectValue = (value: unknown) => {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return String(value.value);
  }

  return value ? String(value) : '';
};

export const StockFiltersModal = ({
  filters,
  isLoading,
  isOpen,
  onApply,
  onClose,
  warehouses,
}: StockFiltersModalProps) => {
  const [localFilters, setLocalFilters] = useState<StockFilters>(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [filters, isOpen]);

  const cityOptions = useMemo(() => buildDepartmentOptions(warehouses), [warehouses]);
  const buildingOptions = useMemo(
    () => buildSubdivisionOptions(warehouses, localFilters.CITY_ID),
    [localFilters.CITY_ID, warehouses],
  );

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <Modal
      className="w-[720px] max-w-[calc(100vw-32px)]"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      withCloseButton
      isCloseOutside={false}
    >
      <Modal.Header title="Фильтрация склада" />
      <Modal.Content className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Город"
          value={localFilters.CITY_ID[0] || null}
          options={cityOptions}
          onChange={(value) => {
            const cityId = normalizeSelectValue(value);

            setLocalFilters((prevFilters) => ({
              ...prevFilters,
              BUILDING_ID: [],
              CITY_ID: cityId ? [cityId] : [],
            }));
          }}
          fullWidth
          hasSearch
          isLoading={isLoading}
        />
        <Select
          label="Здание"
          value={localFilters.BUILDING_ID[0] || null}
          options={buildingOptions}
          onChange={(value) =>
            setLocalFilters((prevFilters) => ({
              ...prevFilters,
              BUILDING_ID: normalizeSelectValue(value) ? [normalizeSelectValue(value)] : [],
            }))
          }
          fullWidth
          hasSearch
          isLoading={isLoading}
          disabled={!localFilters.CITY_ID.length}
        />
        <Select
          label="Статус"
          value={localFilters.STATUS_ID[0] || null}
          options={stockStatusOptions}
          onChange={(value) =>
            setLocalFilters((prevFilters) => ({
              ...prevFilters,
              STATUS_ID: normalizeSelectValue(value) ? [normalizeSelectValue(value)] : [],
            }))
          }
          fullWidth
        />
        <Select
          label="Статус ремонта"
          value={localFilters.REPAIR[0] || null}
          options={stockRepairOptions}
          onChange={(value) =>
            setLocalFilters((prevFilters) => ({
              ...prevFilters,
              REPAIR: normalizeSelectValue(value) ? [normalizeSelectValue(value)] : [],
            }))
          }
          fullWidth
        />
      </Modal.Content>
      <Modal.Actions className="flex justify-end">
        <div className="flex gap-2">
          <Button type="button" variant="outline-neutral" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" variant="primary" onClick={handleApply}>
            Применить
          </Button>
        </div>
      </Modal.Actions>
    </Modal>
  );
};
