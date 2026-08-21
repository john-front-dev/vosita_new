import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, OutlineSystemEdit, Select } from 'alif-ui';
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';

import { useCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { useBuildings, useCabinets, useCities } from '@entities/location';
import type { StockAsset, StockAssetType } from '@entities/stock-asset';
import { normalizeSelectValue } from '@shared/lib';

import {
  type FixedAssetEditFormValues,
  fixedAssetEditSchema,
  type LriEditFormValues,
  lriEditSchema,
} from '../model/stock-asset-action-validation';
import { useStockAssetEdit } from '../model/use-stock-asset-action-mutations';

type StockAssetEditActionProps = { asset: StockAsset; type: StockAssetType };

const toId = (value?: number | string) => String(value ?? '');

export const StockAssetEditAction = ({ asset, type }: StockAssetEditActionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const fixedAssetForm = useForm<FixedAssetEditFormValues>({
    defaultValues: {
      buildingId: toId(asset.building_id),
      cabinetId: toId(asset.cabinet_id),
      categoryId: toId(asset.category_id),
      cityId: toId(asset.city_id),
      exploiterId: toId(asset.exploiter_id),
      inventoryNumber: asset.inventory_number ?? '',
      name: asset.name,
      responsiblePersonId: toId(asset.responsible_person_id),
      serialNumber: asset.serial_number ?? '',
    },
    mode: 'onChange',
    resolver: zodResolver(fixedAssetEditSchema),
  });
  const lriForm = useForm<LriEditFormValues>({
    defaultValues: { name: asset.name, serialNumber: asset.serial_number ?? '' },
    mode: 'onChange',
    resolver: zodResolver(lriEditSchema),
  });
  const cityId = useWatch({ control: fixedAssetForm.control, name: 'cityId' });
  const buildingId = useWatch({ control: fixedAssetForm.control, name: 'buildingId' });
  const fixedValues = useWatch({ control: fixedAssetForm.control });
  const lriValues = useWatch({ control: lriForm.control });
  const isFixedAsset = type === 'fixed-assets';
  const categoriesQuery = useCategories('', isOpen && isFixedAsset);
  const citiesQuery = useCities('', isOpen && isFixedAsset);
  const buildingsQuery = useBuildings(cityId, '', isOpen && isFixedAsset);
  const cabinetsQuery = useCabinets(buildingId, '', isOpen && isFixedAsset);
  const employeesQuery = useEmployees('', isOpen && isFixedAsset);
  const action = useStockAssetEdit({ assetId: asset.id, type, onSuccess: () => setIsOpen(false) });

  const submitFixedAsset: SubmitHandler<FixedAssetEditFormValues> = (values) =>
    action.editAsset({
      building_id: Number(values.buildingId),
      cabinet_id: Number(values.cabinetId),
      category_id: Number(values.categoryId),
      city_id: Number(values.cityId),
      description: '',
      exploiter_id: values.exploiterId,
      inventory_number: values.inventoryNumber,
      name: values.name,
      price: Number(asset.price ?? 0),
      responsible_person_id: values.responsiblePersonId,
      serial_number: values.serialNumber,
    });
  const submitLri: SubmitHandler<LriEditFormValues> = (values) =>
    action.editAsset({ name: values.name, serial_number: values.serialNumber });
  const submit = () =>
    isFixedAsset
      ? fixedAssetForm.handleSubmit(submitFixedAsset)()
      : lriForm.handleSubmit(submitLri)();
  const isValid = isFixedAsset ? fixedAssetForm.formState.isValid : lriForm.formState.isValid;

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="m"
        leftSection={<OutlineSystemEdit />}
        onClick={() => setIsOpen(true)}
      >
        Изменить
      </Button>
      <Modal
        className="w-[560px] max-w-[calc(100vw-32px)]"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered
        withCloseButton
      >
        <Modal.Header title={`Редактирование ${isFixedAsset ? 'ОС' : 'ПАУ'}`} />
        <Modal.Content className="flex flex-col gap-4">
          {isFixedAsset ? (
            <>
              <Input
                label="Наименование"
                value={fixedValues.name}
                onChange={(event) =>
                  fixedAssetForm.setValue('name', event.target.value, { shouldValidate: true })
                }
                fullWidth
              />
              <Input
                label="Серийный номер"
                value={fixedValues.serialNumber}
                onChange={(event) =>
                  fixedAssetForm.setValue('serialNumber', event.target.value, {
                    shouldValidate: true,
                  })
                }
                fullWidth
              />
              <Input
                label="Инвентарный номер"
                value={fixedValues.inventoryNumber}
                onChange={(event) =>
                  fixedAssetForm.setValue('inventoryNumber', event.target.value, {
                    shouldValidate: true,
                  })
                }
                fullWidth
              />
              <Input label="Цена" value={String(asset.price ?? '')} disabled fullWidth />
              <Select
                label="Категория"
                value={fixedValues.categoryId || null}
                options={categoriesQuery.categories.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                onChange={(value) =>
                  fixedAssetForm.setValue('categoryId', normalizeSelectValue(value), {
                    shouldValidate: true,
                  })
                }
                fullWidth
              />
              {asset.status_id !== 3 ? (
                <Select
                  label="Заведующий складом"
                  value={fixedValues.responsiblePersonId || null}
                  options={employeesQuery.employees.map((item) => ({
                    label: item.full_name,
                    value: String(item.id),
                  }))}
                  onChange={(value) =>
                    fixedAssetForm.setValue('responsiblePersonId', normalizeSelectValue(value))
                  }
                  fullWidth
                />
              ) : (
                <>
                  <Select
                    label="Ответственное лицо"
                    value={fixedValues.responsiblePersonId || null}
                    options={employeesQuery.employees.map((item) => ({
                      label: item.full_name,
                      value: String(item.id),
                    }))}
                    onChange={(value) =>
                      fixedAssetForm.setValue('responsiblePersonId', normalizeSelectValue(value))
                    }
                    fullWidth
                  />
                  <Select
                    label="Пользователь"
                    value={fixedValues.exploiterId || null}
                    options={employeesQuery.employees.map((item) => ({
                      label: item.full_name,
                      value: String(item.id),
                    }))}
                    onChange={(value) =>
                      fixedAssetForm.setValue('exploiterId', normalizeSelectValue(value))
                    }
                    fullWidth
                  />
                </>
              )}
              <Select
                label="Город"
                value={cityId || null}
                options={citiesQuery.cities.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                onChange={(value) => {
                  fixedAssetForm.setValue('cityId', normalizeSelectValue(value), {
                    shouldValidate: true,
                  });
                  fixedAssetForm.setValue('buildingId', '');
                  fixedAssetForm.setValue('cabinetId', '');
                }}
                fullWidth
              />
              <Select
                label="Здание"
                value={buildingId || null}
                options={buildingsQuery.buildings.map((item) => ({
                  label: item.name ?? item.build ?? '',
                  value: String(item.id),
                }))}
                onChange={(value) => {
                  fixedAssetForm.setValue('buildingId', normalizeSelectValue(value), {
                    shouldValidate: true,
                  });
                  fixedAssetForm.setValue('cabinetId', '');
                }}
                fullWidth
                disabled={!cityId}
              />
              <Select
                label="Кабинет"
                value={fixedValues.cabinetId || null}
                options={cabinetsQuery.cabinets.map((item) => ({
                  label: item.room,
                  value: String(item.id),
                }))}
                onChange={(value) =>
                  fixedAssetForm.setValue('cabinetId', normalizeSelectValue(value), {
                    shouldValidate: true,
                  })
                }
                fullWidth
                disabled={!buildingId}
              />
            </>
          ) : (
            <>
              <Input
                label="Наименование"
                value={lriValues.name}
                onChange={(event) =>
                  lriForm.setValue('name', event.target.value, { shouldValidate: true })
                }
                fullWidth
              />
              <Input
                label="Серийный номер"
                value={lriValues.serialNumber}
                onChange={(event) =>
                  lriForm.setValue('serialNumber', event.target.value, { shouldValidate: true })
                }
                fullWidth
              />
            </>
          )}
        </Modal.Content>
        <Modal.Actions className="flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={action.isEditing}
            disabled={!isValid}
            onClick={submit}
          >
            Изменить
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
