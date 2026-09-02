import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, OutlineSystemEdit, Select, TextArea } from 'alif-ui';
import { useForm, useWatch } from 'react-hook-form';

import { useMbpCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import {
  getStorageId,
  getStorageName,
  useAllWarehouses,
  useBuildings,
  useCabinets,
  useCities,
} from '@entities/location';
import type { MbpDetails } from '@entities/mbp';
import { normalizeSelectValue, notifyError } from '@shared/lib';

import { type MbpEditFormValues, mbpEditSchema } from '../model/mbp-action-validation';
import { useMbpEdit } from '../model/use-mbp-action-mutations';

const toId = (value?: number | string) => String(value ?? '');

type SelectOption = { label: string; value: string };

const includeCurrentOption = (options: SelectOption[], current?: SelectOption): SelectOption[] => {
  if (!current?.label || !current.value || options.some((option) => option.value === current.value)) {
    return options;
  }

  return [current, ...options];
};

const getCurrentOption = (
  value: string | undefined,
  currentId: number | string | undefined,
  currentLabel: string | undefined,
): SelectOption | undefined =>
  value === toId(currentId) ? { label: currentLabel ?? '', value: toId(currentId) } : undefined;

const getInitialValues = (mbp: MbpDetails): MbpEditFormValues => ({
  buildingId: toId(mbp.subdivision_id),
  categoryId: toId(mbp.category_id),
  cityId: toId(mbp.department_id),
  comment: mbp.comment ?? '',
  currency: mbp.currency ?? '',
  price: String(mbp.price ?? ''),
  responsibleId: toId(mbp.responsible_id),
  roomId: toId(mbp.rooms_id),
  serialNumber: mbp.serial_number ?? '',
  storageId: toId(mbp.storage_id),
  unit: mbp.unit ?? '',
});

export const MbpEditAction = ({ mbp }: { mbp: MbpDetails }) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<MbpEditFormValues>({
    defaultValues: getInitialValues(mbp),
    mode: 'onChange',
    resolver: zodResolver(mbpEditSchema),
  });
  const values = useWatch({ control: form.control });
  const { categories } = useMbpCategories('', isOpen);
  const { employees } = useEmployees('', isOpen);
  const { cities } = useCities('', isOpen);
  const { buildings } = useBuildings(values.cityId, '', isOpen);
  const { cabinets } = useCabinets(values.buildingId, '', isOpen);
  const { warehouses, isLoading: isWarehousesLoading, isFetching: isWarehousesFetching } =
    useAllWarehouses(isOpen && Boolean(values.buildingId), values.buildingId);
  const action = useMbpEdit({ id: mbp.id, onSuccess: () => setIsOpen(false) });
  const responsibleOptions = includeCurrentOption(
    employees.map((employee) => ({
      label: employee.full_name,
      value: String(employee.id),
    })),
    getCurrentOption(values.responsibleId, mbp.responsible_id, mbp.responsible_name),
  );
  const categoryOptions = includeCurrentOption(
    categories.map((category) => ({
      label: category.name,
      value: String(category.id),
    })),
    getCurrentOption(values.categoryId, mbp.category_id, mbp.category_name),
  );
  const cityOptions = includeCurrentOption(
    cities.map((city) => ({ label: city.name, value: String(city.id) })),
    getCurrentOption(values.cityId, mbp.department_id, mbp.department_name),
  );
  const buildingOptions = includeCurrentOption(
    buildings.map((building) => ({
      label: building.name ?? building.build ?? '',
      value: String(building.id),
    })),
    getCurrentOption(values.buildingId, mbp.subdivision_id, mbp.subdivision_name),
  );
  const warehouseOptions = includeCurrentOption(
    warehouses
      .map((warehouse) => ({
        label: getStorageName(warehouse) ?? '',
        value: String(getStorageId(warehouse) ?? ''),
      }))
      .filter((option) => option.label && option.value),
    getCurrentOption(values.storageId, mbp.storage_id, mbp.storage_name),
  );
  const roomOptions = includeCurrentOption(
    cabinets.map((room) => ({ label: room.room, value: String(room.id) })),
    getCurrentOption(values.roomId, mbp.rooms_id, mbp.rooms_name),
  );

  const open = () => {
    form.reset(getInitialValues(mbp));
    setIsOpen(true);
  };

  const submit = (formValues: MbpEditFormValues) => {
    const initial = getInitialValues(mbp);
    const payload: Record<string, unknown> = {};
    const setChanged = (key: string, value: unknown, previous: unknown) => {
      if (String(value ?? '') !== String(previous ?? '')) payload[key] = value;
    };

    setChanged('unit', formValues.unit.trim(), initial.unit);
    setChanged('price', Number(formValues.price), Number(initial.price));
    setChanged('currency', formValues.currency.trim(), initial.currency);
    setChanged('responsible_id', formValues.responsibleId, initial.responsibleId);
    setChanged('rooms_id', Number(formValues.roomId || 0), Number(initial.roomId || 0));
    setChanged(
      'subdivision_id',
      Number(formValues.buildingId || 0),
      Number(initial.buildingId || 0),
    );
    setChanged('department_id', Number(formValues.cityId || 0), Number(initial.cityId || 0));
    setChanged('storage_id', Number(formValues.storageId || 0), Number(initial.storageId || 0));
    setChanged('category_id', Number(formValues.categoryId || 0), Number(initial.categoryId || 0));
    setChanged('serial_number', formValues.serialNumber, initial.serialNumber);
    setChanged('comment', formValues.comment, initial.comment);

    if (Object.keys(payload).length === 0) {
      notifyError('Нет изменений для сохранения');
      return;
    }

    action.edit(payload);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="m"
        leftSection={<OutlineSystemEdit />}
        onClick={open}
      >
        Изменить
      </Button>
      <Modal
        className="w-[560px]"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered
        withCloseButton
      >
        <Modal.Header title="Редактирование МБП" />
        <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          <Input
            label="Единица измерения"
            value={values.unit}
            onChange={(event) => form.setValue('unit', event.target.value)}
            fullWidth
          />
          <Input
            label="Цена"
            value={values.price}
            onChange={(event) =>
              form.setValue(
                'price',
                event.target.value
                  .replace(/,/g, '.')
                  .replace(/[^0-9.]/g, '')
                  .replace(/(\..*)\./g, '$1'),
                { shouldValidate: true },
              )
            }
            fullWidth
          />
          <Input
            label="Валюта"
            value={values.currency}
            onChange={(event) => form.setValue('currency', event.target.value)}
            fullWidth
          />
          <Input
            label="Серийный номер"
            value={values.serialNumber}
            onChange={(event) => form.setValue('serialNumber', event.target.value)}
            fullWidth
          />
          <Select
            label="Ответственное лицо"
            value={values.responsibleId || null}
            options={responsibleOptions}
            onChange={(value) =>
              form.setValue('responsibleId', normalizeSelectValue(value), { shouldValidate: true })
            }
            fullWidth
          />
          <Select
            label="Категория"
            value={values.categoryId || null}
            options={categoryOptions}
            onChange={(value) =>
              form.setValue('categoryId', normalizeSelectValue(value), { shouldValidate: true })
            }
            fullWidth
          />
          <Select
            label="Город"
            value={values.cityId || null}
            options={cityOptions}
            onChange={(value) => {
              form.setValue('cityId', normalizeSelectValue(value), { shouldValidate: true });
              form.setValue('buildingId', '');
              form.setValue('storageId', '');
              form.setValue('roomId', '');
            }}
            fullWidth
          />
          <Select
            label="Здание"
            value={values.buildingId || null}
            options={buildingOptions}
            onChange={(value) => {
              form.setValue('buildingId', normalizeSelectValue(value), { shouldValidate: true });
              form.setValue('storageId', '');
              form.setValue('roomId', '');
            }}
            disabled={!values.cityId}
            fullWidth
          />
          <Select
            label="Склад"
            value={values.storageId || null}
            options={warehouseOptions}
            onChange={(value) =>
              form.setValue('storageId', normalizeSelectValue(value), { shouldValidate: true })
            }
            isLoading={isWarehousesLoading || isWarehousesFetching}
            disabled={!values.buildingId}
            fullWidth
          />
          <Select
            label="Кабинет"
            value={values.roomId || null}
            options={roomOptions}
            onChange={(value) =>
              form.setValue('roomId', normalizeSelectValue(value), { shouldValidate: true })
            }
            disabled={!values.buildingId}
            fullWidth
          />
          <TextArea
            label="Комментарий"
            value={values.comment}
            onChange={(event) => form.setValue('comment', event.target.value)}
            fullWidth
          />
        </Modal.Content>
        <Modal.Actions className="flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={action.isEditing}
            disabled={!form.formState.isValid}
            onClick={form.handleSubmit(submit)}
          >
            Изменить
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
