import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, OutlineSystemEdit, Select, TextArea } from 'alif-ui';
import { useForm, useWatch } from 'react-hook-form';

import { useMbpCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { useAllWarehouses, useBuildings, useCabinets, useCities } from '@entities/location';
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
  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<MbpEditFormValues>({
    defaultValues: getInitialValues(mbp),
    mode: 'onChange',
    resolver: zodResolver(mbpEditSchema),
  });
  const {
    buildingId,
    categoryId,
    cityId,
    comment,
    currency,
    price,
    responsibleId,
    roomId,
    serialNumber,
    storageId,
    unit,
  } = useWatch({ control });
  const { categories } = useMbpCategories('', isOpen);
  const { employees } = useEmployees('', isOpen);
  const { cities } = useCities('', isOpen);
  const { buildings } = useBuildings(cityId, '', isOpen);
  const { cabinets } = useCabinets(buildingId, '', isOpen);
  const { warehouses, isLoading: isWarehousesLoading, isFetching: isWarehousesFetching } =
    useAllWarehouses(isOpen && Boolean(buildingId), buildingId);
  const { edit, isEditing } = useMbpEdit({ id: mbp.id, onSuccess: () => setIsOpen(false) });
  const responsibleOptions = includeCurrentOption(
    employees.map((employee) => ({
      label: employee.full_name,
      value: String(employee.id),
    })),
    getCurrentOption(responsibleId, mbp.responsible_id, mbp.responsible_name),
  );
  const categoryOptions = includeCurrentOption(
    categories.map((category) => ({
      label: category.name,
      value: String(category.id),
    })),
    getCurrentOption(categoryId, mbp.category_id, mbp.category_name),
  );
  const cityOptions = includeCurrentOption(
    cities.map((city) => ({ label: city.name, value: String(city.id) })),
    getCurrentOption(cityId, mbp.department_id, mbp.department_name),
  );
  const buildingOptions = includeCurrentOption(
    buildings.map((building) => ({
      label: building.name ?? building.build ?? '',
      value: String(building.id),
    })),
    getCurrentOption(buildingId, mbp.subdivision_id, mbp.subdivision_name),
  );
  const warehouseOptions = includeCurrentOption(
    warehouses
      .map((warehouse) => ({
        label: warehouse.storage_name,
        value: String(warehouse.storage_id),
      }))
      .filter((option) => option.label && option.value),
    getCurrentOption(storageId, mbp.storage_id, mbp.storage_name),
  );
  const roomOptions = includeCurrentOption(
    cabinets.map((room) => ({ label: room.room, value: String(room.id) })),
    getCurrentOption(roomId, mbp.rooms_id, mbp.rooms_name),
  );

  const open = () => {
    reset(getInitialValues(mbp));
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

    edit(payload);
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
            value={unit}
            onChange={(event) => setValue('unit', event.target.value)}
            fullWidth
          />
          <Input
            label="Цена"
            value={price}
            onChange={(event) =>
              setValue(
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
            value={currency}
            onChange={(event) => setValue('currency', event.target.value)}
            fullWidth
          />
          <Input
            label="Серийный номер"
            value={serialNumber}
            onChange={(event) => setValue('serialNumber', event.target.value)}
            fullWidth
          />
          <Select
            label="Ответственное лицо"
            value={responsibleId || null}
            options={responsibleOptions}
            onChange={(value) =>
              setValue('responsibleId', normalizeSelectValue(value), { shouldValidate: true })
            }
            fullWidth
          />
          <Select
            label="Категория"
            value={categoryId || null}
            options={categoryOptions}
            onChange={(value) =>
              setValue('categoryId', normalizeSelectValue(value), { shouldValidate: true })
            }
            fullWidth
          />
          <Select
            label="Город"
            value={cityId || null}
            options={cityOptions}
            onChange={(value) => {
              setValue('cityId', normalizeSelectValue(value), { shouldValidate: true });
              setValue('buildingId', '');
              setValue('storageId', '');
              setValue('roomId', '');
            }}
            fullWidth
          />
          <Select
            label="Здание"
            value={buildingId || null}
            options={buildingOptions}
            onChange={(value) => {
              setValue('buildingId', normalizeSelectValue(value), { shouldValidate: true });
              setValue('storageId', '');
              setValue('roomId', '');
            }}
            disabled={!cityId}
            fullWidth
          />
          <Select
            label="Склад"
            value={storageId || null}
            options={warehouseOptions}
            onChange={(value) =>
              setValue('storageId', normalizeSelectValue(value), { shouldValidate: true })
            }
            isLoading={isWarehousesLoading || isWarehousesFetching}
            disabled={!buildingId}
            fullWidth
          />
          <Select
            label="Кабинет"
            value={roomId || null}
            options={roomOptions}
            onChange={(value) =>
              setValue('roomId', normalizeSelectValue(value), { shouldValidate: true })
            }
            disabled={!buildingId}
            fullWidth
          />
          <TextArea
            label="Комментарий"
            value={comment}
            onChange={(event) => setValue('comment', event.target.value)}
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
            isLoading={isEditing}
            disabled={!isValid}
            onClick={handleSubmit(submit)}
          >
            Изменить
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
