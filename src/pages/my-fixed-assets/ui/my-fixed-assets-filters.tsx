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

const MyFixedAssetsFiltersModal = ({
  filters,
  onApply,
  onClose,
}: Pick<Props, 'filters' | 'onApply' | 'onClose'>) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const employeesQuery = useEmployees();
  const categoriesQuery = useCategories();

  const setFilter = (key: keyof MyFixedAssetsFiltersValues, value: unknown) => {
    const normalizedValue = normalizeSelectValue(value);

    setLocalFilters((currentFilters) => ({
      ...currentFilters,
      [key]: normalizedValue ? [normalizedValue] : [],
    }));
  };

  return (
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
          options={employeesQuery.employees.map((employee) => ({
            label: employee.full_name,
            value: String(employee.id),
          }))}
          onChange={(value) => setFilter('EXPLOITER_ID', value)}
          isLoading={employeesQuery.isLoading || employeesQuery.isFetching}
          fullWidth
          proportions="m"
        />
        <Select
          label="Категория"
          value={localFilters.CATEGORY_ID[0] || null}
          options={categoriesQuery.categories.map((category) => ({
            label: category.name,
            value: String(category.id),
          }))}
          onChange={(value) => setFilter('CATEGORY_ID', value)}
          isLoading={categoriesQuery.isLoading || categoriesQuery.isFetching}
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
  );
};

export const MyFixedAssetsFilters = ({ filters, isOpen, onApply, onClick, onClose }: Props) => (
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
    {isOpen && <MyFixedAssetsFiltersModal filters={filters} onApply={onApply} onClose={onClose} />}
  </>
);
