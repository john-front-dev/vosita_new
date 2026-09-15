import { useState } from 'react';
import { Button, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';

import { useCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { normalizeSelectValue } from '@shared/lib';

import type { MyFixedAssetsFilters as MyFixedAssetsFiltersValues } from '../model/my-fixed-assets-filters';

type Props = {
  filters: MyFixedAssetsFiltersValues;
  isOpen: boolean;
  onApply: (filters: MyFixedAssetsFiltersValues) => void;
  onClick: () => void;
  onClose: () => void;
};

export const MyFixedAssetsFilters = ({ filters, isOpen, onApply, onClick, onClose }: Props) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const {
    employees,
    isFetching: isEmployeesFetching,
    isLoading: isEmployeesLoading,
  } = useEmployees('', isOpen);
  const {
    categories,
    isFetching: isCategoriesFetching,
    isLoading: isCategoriesLoading,
  } = useCategories('', isOpen);

  const setFilter = (key: keyof MyFixedAssetsFiltersValues, value: unknown) => {
    const normalizedValue = normalizeSelectValue(value);

    setLocalFilters((currentFilters) => ({
      ...currentFilters,
      [key]: normalizedValue ? [normalizedValue] : [],
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
          className="w-150"
          isOpen
          onClose={onClose}
          isCentered
          withCloseButton
          isCloseOutside={false}
        >
          <Modal.Header title="Фильтрация списка" />
          <Modal.Content className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Пользователь"
              value={localFilters.EXPLOITER_ID[0] || null}
              options={employees.map((employee) => ({
                label: employee.full_name,
                value: String(employee.id),
              }))}
              onChange={(value) => setFilter('EXPLOITER_ID', value)}
              isLoading={isEmployeesLoading || isEmployeesFetching}
              fullWidth
              proportions="m"
            />
            <Select
              label="Категория"
              value={localFilters.CATEGORY_ID[0] || null}
              options={categories.map((category) => ({
                label: category.name,
                value: String(category.id),
              }))}
              onChange={(value) => setFilter('CATEGORY_ID', value)}
              isLoading={isCategoriesLoading || isCategoriesFetching}
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
