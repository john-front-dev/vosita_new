import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, OutlineSystemEdit, Select } from 'alif-ui';
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';

import { useCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { useBuildings, useCabinets, useCities } from '@entities/location';
import {
  isOsLikeStockAssetType,
  type StockAsset,
  type StockAssetType,
} from '@entities/stock-asset';
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
  const {
    control: fixedAssetControl,
    formState: { isValid: isFixedAssetValid },
    handleSubmit: handleFixedAssetSubmit,
    setValue: setFixedAssetValue,
  } = useForm<FixedAssetEditFormValues>({
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
  const {
    control: lriControl,
    formState: { isValid: isLriValid },
    handleSubmit: handleLriSubmit,
    setValue: setLriValue,
  } = useForm<LriEditFormValues>({
    defaultValues: { name: asset.name, serialNumber: asset.serial_number ?? '' },
    mode: 'onChange',
    resolver: zodResolver(lriEditSchema),
  });
  const cityId = useWatch({ control: fixedAssetControl, name: 'cityId' });
  const buildingId = useWatch({ control: fixedAssetControl, name: 'buildingId' });
  const {
    cabinetId,
    categoryId,
    exploiterId,
    inventoryNumber,
    name: fixedAssetName,
    responsiblePersonId,
    serialNumber: fixedAssetSerialNumber,
  } = useWatch({ control: fixedAssetControl });
  const { name: lriName, serialNumber: lriSerialNumber } = useWatch({ control: lriControl });
  const isFixedAsset = isOsLikeStockAssetType(type);
  const { categories } = useCategories('', isOpen && isFixedAsset);
  const { cities } = useCities('', isOpen && isFixedAsset);
  const { buildings } = useBuildings(cityId, '', isOpen && isFixedAsset);
  const { cabinets } = useCabinets(buildingId, '', isOpen && isFixedAsset);
  const { employees } = useEmployees('', isOpen && isFixedAsset);
  const { editAsset, isEditing } = useStockAssetEdit({
    assetId: asset.id,
    type,
    onSuccess: () => setIsOpen(false),
  });

  const submitFixedAsset: SubmitHandler<FixedAssetEditFormValues> = (values) =>
    editAsset({
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
    editAsset({ name: values.name, serial_number: values.serialNumber });
  const submit = () =>
    isFixedAsset
      ? handleFixedAssetSubmit(submitFixedAsset)()
      : handleLriSubmit(submitLri)();
  const isValid = isFixedAsset ? isFixedAssetValid : isLriValid;

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
        className="w-[560px]"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered
        withCloseButton
      >
        <Modal.Header
          title={`Редактирование ${type === 'other' ? 'объекта' : isFixedAsset ? 'ОС' : 'ПАУ'}`}
        />
        <Modal.Content className="flex flex-col gap-4">
          {isFixedAsset ? (
            <>
              <Input
                label="Наименование"
                value={fixedAssetName}
                onChange={(event) =>
                  setFixedAssetValue('name', event.target.value, { shouldValidate: true })
                }
                fullWidth
              />
              <Input
                label="Серийный номер"
                value={fixedAssetSerialNumber}
                onChange={(event) =>
                  setFixedAssetValue('serialNumber', event.target.value, {
                    shouldValidate: true,
                  })
                }
                fullWidth
              />
              <Input
                label="Инвентарный номер"
                value={inventoryNumber}
                onChange={(event) =>
                  setFixedAssetValue('inventoryNumber', event.target.value, {
                    shouldValidate: true,
                  })
                }
                fullWidth
              />
              <Input label="Цена" value={String(asset.price ?? '')} disabled fullWidth />
              <Select
                label="Категория"
                value={categoryId || null}
                options={categories.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                onChange={(value) =>
                  setFixedAssetValue('categoryId', normalizeSelectValue(value), {
                    shouldValidate: true,
                  })
                }
                fullWidth
              />
              {asset.status_id !== 3 ? (
                <Select
                  label="Заведующий складом"
                  value={responsiblePersonId || null}
                  options={employees.map((item) => ({
                    label: item.full_name,
                    value: String(item.id),
                  }))}
                  onChange={(value) =>
                    setFixedAssetValue('responsiblePersonId', normalizeSelectValue(value))
                  }
                  fullWidth
                />
              ) : (
                <>
                  <Select
                    label="Ответственное лицо"
                    value={responsiblePersonId || null}
                    options={employees.map((item) => ({
                      label: item.full_name,
                      value: String(item.id),
                    }))}
                    onChange={(value) =>
                      setFixedAssetValue('responsiblePersonId', normalizeSelectValue(value))
                    }
                    fullWidth
                  />
                  <Select
                    label="Пользователь"
                    value={exploiterId || null}
                    options={employees.map((item) => ({
                      label: item.full_name,
                      value: String(item.id),
                    }))}
                    onChange={(value) =>
                      setFixedAssetValue('exploiterId', normalizeSelectValue(value))
                    }
                    fullWidth
                  />
                </>
              )}
              <Select
                label="Город"
                value={cityId || null}
                options={cities.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                onChange={(value) => {
                  setFixedAssetValue('cityId', normalizeSelectValue(value), {
                    shouldValidate: true,
                  });
                  setFixedAssetValue('buildingId', '');
                  setFixedAssetValue('cabinetId', '');
                }}
                fullWidth
              />
              <Select
                label="Здание"
                value={buildingId || null}
                options={buildings.map((item) => ({
                  label: item.name ?? item.build ?? '',
                  value: String(item.id),
                }))}
                onChange={(value) => {
                  setFixedAssetValue('buildingId', normalizeSelectValue(value), {
                    shouldValidate: true,
                  });
                  setFixedAssetValue('cabinetId', '');
                }}
                fullWidth
                disabled={!cityId}
              />
              <Select
                label="Кабинет"
                value={cabinetId || null}
                options={cabinets.map((item) => ({
                  label: item.room,
                  value: String(item.id),
                }))}
                onChange={(value) =>
                  setFixedAssetValue('cabinetId', normalizeSelectValue(value), {
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
                value={lriName}
                onChange={(event) =>
                  setLriValue('name', event.target.value, { shouldValidate: true })
                }
                fullWidth
              />
              <Input
                label="Серийный номер"
                value={lriSerialNumber}
                onChange={(event) =>
                  setLriValue('serialNumber', event.target.value, { shouldValidate: true })
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
            isLoading={isEditing}
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
