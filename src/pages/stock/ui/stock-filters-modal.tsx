import { useMemo, useState } from 'react';
import { Button, Modal, Select } from 'alif-ui';

import { useCategories } from '@entities/category';
import { useWarehouseManagers } from '@entities/employee';
import {
  type AccessibleWarehouse,
  buildDepartmentOptions,
  buildSubdivisionOptions,
} from '@entities/location';
import { stockAssetFilterStatusLabels } from '@entities/stock-asset';

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
  { label: stockAssetFilterStatusLabels['1'], value: '1' },
  { label: stockAssetFilterStatusLabels['2'], value: '2' },
  { label: stockAssetFilterStatusLabels['19'], value: '19' },
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
  const categoriesQuery = useCategories('', isOpen);
  const warehouseManagersQuery = useWarehouseManagers(localFilters.BUILDING_ID[0], '', isOpen);

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
      className="w-[720px]"
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
          className="order-3"
          value={localFilters.CITY_ID[0] || null}
          options={cityOptions}
          onChange={(value) => {
            const cityId = normalizeSelectValue(value);

            setLocalFilters((prevFilters) => ({
              ...prevFilters,
              BUILDING_ID: [],
              CITY_ID: cityId ? [cityId] : [],
              WAREHOUSE_MANAGER_ID: [],
            }));
          }}
          fullWidth
          isLoading={isLoading}
        />
        <Select
          label="Здание"
          className="order-4"
          value={localFilters.BUILDING_ID[0] || null}
          options={buildingOptions}
          onChange={(value) =>
            setLocalFilters((prevFilters) => ({
              ...prevFilters,
              BUILDING_ID: normalizeSelectValue(value) ? [normalizeSelectValue(value)] : [],
              WAREHOUSE_MANAGER_ID: [],
            }))
          }
          fullWidth
          isLoading={isLoading}
          disabled={!localFilters.CITY_ID.length}
        />
        <Select
          label="Категория"
          className="order-2"
          value={localFilters.CATEGORY_ID[0] || null}
          options={categoriesQuery.categories.map((category) => ({
            label: category.name,
            value: String(category.id),
          }))}
          onChange={(value) =>
            setLocalFilters((prevFilters) => ({
              ...prevFilters,
              CATEGORY_ID: normalizeSelectValue(value) ? [normalizeSelectValue(value)] : [],
            }))
          }
          fullWidth
          isLoading={categoriesQuery.isLoading || categoriesQuery.isFetching}
        />
        <Select
          label="Заведующий складом"
          className="order-1"
          value={localFilters.WAREHOUSE_MANAGER_ID[0] || null}
          options={warehouseManagersQuery.warehouseManagers.map((manager) => ({
            label: manager.user_name,
            value: manager.user_id,
          }))}
          onChange={(value) =>
            setLocalFilters((prevFilters) => ({
              ...prevFilters,
              WAREHOUSE_MANAGER_ID: normalizeSelectValue(value)
                ? [normalizeSelectValue(value)]
                : [],
            }))
          }
          fullWidth
          isLoading={warehouseManagersQuery.isLoading || warehouseManagersQuery.isFetching}
          disabled={!localFilters.BUILDING_ID.length}
        />
        <Select
          label="Статус"
          className="order-5"
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
          className="order-6"
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
