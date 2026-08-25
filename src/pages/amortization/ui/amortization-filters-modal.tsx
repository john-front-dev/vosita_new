import { useState } from 'react';
import { Button, Modal, Select } from 'alif-ui';

import { useCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { useBuildings, useCabinets, useCities } from '@entities/location';
import { normalizeSelectValue } from '@shared/lib';

import type { AmortizationFilters } from '../model/types';

type AmortizationFiltersModalProps = {
  filters: AmortizationFilters;
  isOpen: boolean;
  onApply: (filters: AmortizationFilters) => void;
  onClose: () => void;
};

export const AmortizationFiltersModal = ({
  filters,
  isOpen,
  onApply,
  onClose,
}: AmortizationFiltersModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const cities = useCities('', isOpen);
  const categories = useCategories('', isOpen);
  const buildings = useBuildings(localFilters.CITY_ID, '', isOpen);
  const cabinets = useCabinets(localFilters.BUILDING_ID, '', isOpen);
  const employees = useEmployees('', isOpen);
  const update = (values: Partial<AmortizationFilters>) =>
    setLocalFilters((current) => ({ ...current, ...values }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      withCloseButton
      isCloseOutside={false}
      className="w-180 max-w-[calc(100vw-32px)]"
    >
      <Modal.Header title="Фильтрация амортизации" />
      <Modal.Content className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Город"
          value={localFilters.CITY_ID || null}
          options={cities.cities.map((item) => ({ label: item.name, value: String(item.id) }))}
          onChange={(value) =>
            update({ BUILDING_ID: '', CITY_ID: normalizeSelectValue(value), ROOM_ID: '' })
          }
          fullWidth
        />
        <Select
          label="Здание"
          value={localFilters.BUILDING_ID || null}
          options={buildings.buildings.map((item) => ({
            label: item.name ?? item.build ?? '-',
            value: String(item.id),
          }))}
          onChange={(value) => update({ BUILDING_ID: normalizeSelectValue(value), ROOM_ID: '' })}
          disabled={!localFilters.CITY_ID}
          fullWidth
        />
        <Select
          label="Кабинет"
          value={localFilters.ROOM_ID || null}
          options={cabinets.cabinets.map((item) => ({ label: item.room, value: String(item.id) }))}
          onChange={(value) => update({ ROOM_ID: normalizeSelectValue(value) })}
          disabled={!localFilters.BUILDING_ID}
          fullWidth
        />
        <Select
          label="Категория"
          value={localFilters.CATEGORY_ID || null}
          options={categories.categories.map((item) => ({
            label: item.name,
            value: String(item.id),
          }))}
          onChange={(value) => update({ CATEGORY_ID: normalizeSelectValue(value) })}
          fullWidth
        />
        <Select
          label="Ответственное лицо"
          value={localFilters.RESPONSIBLE_PERSON_ID || null}
          options={employees.employees.map((item) => ({
            label: item.full_name,
            value: String(item.id),
          }))}
          onChange={(value) => update({ RESPONSIBLE_PERSON_ID: normalizeSelectValue(value) })}
          fullWidth
        />
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-3">
        <Button type="button" variant="outline-neutral" onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            onApply(localFilters);
            onClose();
          }}
        >
          Применить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
