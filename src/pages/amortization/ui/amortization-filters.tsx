import { Button, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { useCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { useBuildings, useCabinets, useCities } from '@entities/location';

import type { AmortizationFilters as AmortizationFiltersValues } from '../model/types';

type AmortizationFiltersProps = {
  filters: AmortizationFiltersValues;
  isOpen: boolean;
  onApply: (filters: AmortizationFiltersValues) => void;
  onClick: () => void;
  onClose: () => void;
};

export const AmortizationFilters = ({
  filters,
  isOpen,
  onApply,
  onClick,
  onClose,
}: AmortizationFiltersProps) => {
  const { control, getValues, reset, setValue } = useForm<AmortizationFiltersValues>({
    defaultValues: filters,
  });
  const cityId = useWatch({ control, name: 'CITY_ID' });
  const buildingId = useWatch({ control, name: 'BUILDING_ID' });
  const { cities } = useCities('', isOpen);
  const { categories } = useCategories('', isOpen);
  const { buildings } = useBuildings(cityId, '', isOpen);
  const { cabinets } = useCabinets(buildingId, '', isOpen);
  const { employees } = useEmployees('', isOpen);

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="l"
        leftSection={<OutlineSystemFilterFromLessToMore />}
        onClick={() => {
          reset(filters);
          onClick();
        }}
      >
        Фильтр
      </Button>
      {isOpen && (
        <Modal
          isOpen
          onClose={onClose}
          isCentered
          withCloseButton
          isCloseOutside={false}
          className="w-180"
        >
          <Modal.Header title="Фильтрация амортизации" />
          <Modal.Content className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="CITY_ID"
              render={({ field }) => (
                <Select
                  label="Город"
                  value={field.value || null}
                  options={cities.map((item) => ({ label: item.name, value: String(item.id) }))}
                  onChange={(value) => {
                    field.onChange(value ?? '');
                    setValue('BUILDING_ID', '');
                    setValue('ROOM_ID', '');
                  }}
                  fullWidth
                />
              )}
            />
            <Controller
              control={control}
              name="BUILDING_ID"
              render={({ field }) => (
                <Select
                  label="Здание"
                  value={field.value || null}
                  options={buildings.map((item) => ({
                    label: item.name ?? item.build ?? '-',
                    value: String(item.id),
                  }))}
                  onChange={(value) => {
                    field.onChange(value ?? '');
                    setValue('ROOM_ID', '');
                  }}
                  disabled={!cityId}
                  fullWidth
                />
              )}
            />
            <Controller
              control={control}
              name="ROOM_ID"
              render={({ field }) => (
                <Select
                  label="Кабинет"
                  value={field.value || null}
                  options={cabinets.map((item) => ({
                    label: item.room,
                    value: String(item.id),
                  }))}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={!buildingId}
                  fullWidth
                />
              )}
            />
            <Controller
              control={control}
              name="CATEGORY_ID"
              render={({ field }) => (
                <Select
                  label="Категория"
                  value={field.value || null}
                  options={categories.map((item) => ({
                    label: item.name,
                    value: String(item.id),
                  }))}
                  onChange={(value) => field.onChange(value ?? '')}
                  fullWidth
                />
              )}
            />
            <Controller
              control={control}
              name="RESPONSIBLE_PERSON_ID"
              render={({ field }) => (
                <Select
                  label="Ответственное лицо"
                  value={field.value || null}
                  options={employees.map((item) => ({
                    label: item.full_name,
                    value: String(item.id),
                  }))}
                  onChange={(value) => field.onChange(value ?? '')}
                  fullWidth
                />
              )}
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
                onApply(getValues());
                onClose();
              }}
            >
              Применить
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
};
