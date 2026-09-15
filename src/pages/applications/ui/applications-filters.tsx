import { useMemo, useState } from 'react';
import { Button, Modal, OutlineSystemFilterFromLessToMore, SelectMultiple } from 'alif-ui';

import {
  buildDepartmentOptions,
  buildStorageOptions,
  buildSubdivisionOptions,
  type WarehouseLocation,
} from '@entities/location';

import type { ApplicationFilters } from '../model/types';

type ApplicationsFiltersProps = {
  filters: ApplicationFilters;
  isLoading: boolean;
  isOpen: boolean;
  onApply: (filters: ApplicationFilters) => void;
  onClick: () => void;
  onClose: () => void;
  warehouses: WarehouseLocation[];
};

type SelectValue = string | number | { value: string | number };

const normalizeValues = (values: SelectValue[]) =>
  values
    .map((value) => (typeof value === 'object' ? value.value : value))
    .map(String)
    .filter(Boolean);

const keepAllowedValues = (values: string[], options: Array<{ value: string }>) => {
  const allowedValues = new Set(options.map((option) => option.value));

  return values.filter((value) => allowedValues.has(value));
};

export const ApplicationsFilters = ({
  filters,
  isLoading,
  isOpen,
  onApply,
  onClick,
  onClose,
  warehouses,
}: ApplicationsFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<ApplicationFilters>(filters);

  const departmentOptions = useMemo(() => buildDepartmentOptions(warehouses), [warehouses]);
  const subdivisionOptions = useMemo(
    () => buildSubdivisionOptions(warehouses, localFilters.DEPARTMENT_ID),
    [localFilters.DEPARTMENT_ID, warehouses],
  );
  const storageOptions = useMemo(
    () => buildStorageOptions(warehouses, localFilters.DEPARTMENT_ID, localFilters.SUBDIVISION_ID),
    [localFilters.DEPARTMENT_ID, localFilters.SUBDIVISION_ID, warehouses],
  );

  const handleDepartmentChange = (values: SelectValue[]) => {
    const departmentIds = normalizeValues(values);
    const nextSubdivisionOptions = buildSubdivisionOptions(warehouses, departmentIds);
    const subdivisionIds = keepAllowedValues(localFilters.SUBDIVISION_ID, nextSubdivisionOptions);
    const nextStorageOptions = buildStorageOptions(warehouses, departmentIds, subdivisionIds);

    setLocalFilters({
      DEPARTMENT_ID: departmentIds,
      STORAGE_ID: keepAllowedValues(localFilters.STORAGE_ID, nextStorageOptions),
      SUBDIVISION_ID: subdivisionIds,
    });
  };

  const handleSubdivisionChange = (values: SelectValue[]) => {
    const subdivisionIds = normalizeValues(values);
    const nextStorageOptions = buildStorageOptions(
      warehouses,
      localFilters.DEPARTMENT_ID,
      subdivisionIds,
    );

    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      STORAGE_ID: keepAllowedValues(prevFilters.STORAGE_ID, nextStorageOptions),
      SUBDIVISION_ID: subdivisionIds,
    }));
  };

  const handleStorageChange = (values: SelectValue[]) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      STORAGE_ID: normalizeValues(values),
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
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
          className="w-125"
          isOpen
          onClose={onClose}
          isCentered
          withCloseButton
          isCloseOutside={false}
        >
          <Modal.Header title="Фильтрация списка" />
          <Modal.Content className="flex flex-col gap-4">
            <SelectMultiple
              label="Отдел"
              values={localFilters.DEPARTMENT_ID}
              options={departmentOptions}
              onChange={(values) => handleDepartmentChange(values as SelectValue[])}
              fullWidth
              isLoading={isLoading}
              proportions="m"
            />
            <SelectMultiple
              label="Здание"
              values={localFilters.SUBDIVISION_ID}
              options={subdivisionOptions}
              onChange={(values) => handleSubdivisionChange(values as SelectValue[])}
              fullWidth
              isLoading={isLoading}
              proportions="m"
            />
            <SelectMultiple
              label="Склад"
              values={localFilters.STORAGE_ID}
              options={storageOptions}
              onChange={(values) => handleStorageChange(values as SelectValue[])}
              fullWidth
              isLoading={isLoading}
              proportions="m"
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
      )}
    </>
  );
};
