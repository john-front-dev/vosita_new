import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, DatePicker, Input, Modal, Select } from 'alif-ui';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';

import { formatDateOnly, parseDateOnly } from '@shared/lib';

import { createLocationFormSchema } from '../model/location-form-validation';
import { locationTypeLabels } from '../model/location-tabs';
import type {
  BuildingRecord,
  CabinetRecord,
  CityRecord,
  LocationFormValues,
  LocationRecord,
  LocationType,
  WarehouseRecord,
} from '../model/types';
import { useItemTypes } from '../model/use-item-types';
import {
  useLocationFormBuildings,
  useLocationFormCities,
  useResponsiblePeople,
} from '../model/use-location-form-options';
import { useSaveLocation } from '../model/use-location-mutations';

type LocationFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  record: LocationRecord | null;
  type: LocationType;
};

const emptyForm: LocationFormValues = {
  buildingId: '',
  cityId: '',
  crmId: '',
  endDate: '',
  name: '',
  responsibleId: '',
  responsibleText: '',
  startDate: '',
  storageTypeId: '',
};

const getInitialForm = (type: LocationType, record: LocationRecord | null): LocationFormValues => {
  if (!record) return emptyForm;
  if (type === 'cities') return { ...emptyForm, name: (record as CityRecord).name };
  if (type === 'buildings') {
    const building = record as BuildingRecord;
    return {
      ...emptyForm,
      cityId: String(building.city_id),
      crmId: building.crm_id ?? '',
      endDate: building.end_date?.slice(0, 10) ?? '',
      name: building.name,
      responsibleText: building.responsible ?? '',
      startDate: building.start_date?.slice(0, 10) ?? '',
    };
  }
  if (type === 'cabinets') {
    const cabinet = record as CabinetRecord;
    return {
      ...emptyForm,
      buildingId: String(cabinet.building_id),
      cityId: String(cabinet.city_id),
      name: cabinet.room,
    };
  }
  const warehouse = record as WarehouseRecord;
  return {
    ...emptyForm,
    buildingId: String(warehouse.subdivision_id),
    cityId: String(warehouse.department_id),
    name: warehouse.name,
    responsibleId: warehouse.responsible_id ?? '',
  };
};

export const LocationFormModal = ({
  isOpen,
  onClose,
  record,
  type,
}: LocationFormModalProps) => {
  const isEdit = record !== null;
  const schema = useMemo(() => createLocationFormSchema(type, isEdit), [isEdit, type]);
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<LocationFormValues>({
    defaultValues: getInitialForm(type, record),
    mode: 'onChange',
    resolver: zodResolver(schema),
  });
  const {
    buildingId = '',
    cityId = '',
    crmId = '',
    endDate = '',
    responsibleId = '',
    responsibleText = '',
    startDate = '',
    storageTypeId = '',
  } = useWatch({ control });
  const [employeeSearch, setEmployeeSearch] = useState('');
  const needsHierarchy = type !== 'cities' && !(type === 'warehouses' && isEdit);
  const needsResponsible = (type === 'cabinets' && !isEdit) || type === 'warehouses';
  const { cities, isLoading: isCitiesLoading } = useLocationFormCities(
    isOpen && needsHierarchy,
  );
  const { buildings, isLoading: isBuildingsLoading } = useLocationFormBuildings(
    cityId,
    isOpen && needsHierarchy,
  );
  const { employees, isLoading: isEmployeesLoading } = useResponsiblePeople(
    employeeSearch,
    type === 'cabinets' ? '1,4' : '1,2',
    isOpen && needsResponsible,
  );
  const { isLoading: isItemTypesLoading, itemTypes } = useItemTypes(
    isOpen && type === 'warehouses' && !isEdit,
  );
  const { isSaving, save } = useSaveLocation(type, record, onClose);
  const startDateValue = parseDateOnly(startDate);
  const endDateValue = parseDateOnly(endDate);
  const cityOptions = useMemo(
    () => cities.map((city) => ({ label: city.name, value: String(city.id) })),
    [cities],
  );
  const buildingOptions = useMemo(
    () =>
      buildings.map((building) => ({
        label: building.name,
        value: String(building.id),
      })),
    [buildings],
  );
  const employeeOptions = useMemo(() => {
    const options = employees.map((employee) => ({
      label: employee.full_name,
      value: String(type === 'cabinets' ? employee.id : (employee.user_id ?? employee.id)),
    }));
    const warehouse = type === 'warehouses' && record ? (record as WarehouseRecord) : null;

    if (
      warehouse?.responsible_id &&
      warehouse.responsible_name &&
      !options.some((option) => option.value === warehouse.responsible_id)
    ) {
      options.unshift({ label: warehouse.responsible_name, value: warehouse.responsible_id });
    }

    return options;
  }, [employees, record, type]);

  const handleClose = () => {
    reset(getInitialForm(type, record));
    onClose();
  };
  const submit: SubmitHandler<LocationFormValues> = (formValues) => save(formValues);

  return (
    <Modal className="w-130" isOpen={isOpen} onClose={handleClose} isCentered withCloseButton>
      <Modal.Header
        title={`${isEdit ? 'Изменить' : 'Добавить'} ${locationTypeLabels[type].singular}`}
      />
      <form onSubmit={handleSubmit(submit)}>
        <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          {needsHierarchy && (
            <Select
              label="Город"
              value={cityId || null}
              options={cityOptions}
              onChange={(value) => {
                setValue('cityId', value ?? '', { shouldValidate: true });
                setValue('buildingId', '', { shouldValidate: true });
              }}
              hasError={Boolean(errors.cityId)}
              hintText={errors.cityId?.message}
              isHintAlwaysShown={Boolean(errors.cityId)}
              isLoading={isCitiesLoading}
              fullWidth
            />
          )}
          {needsHierarchy && type !== 'buildings' && (
            <Select
              label="Здание"
              value={buildingId || null}
              options={buildingOptions}
              onChange={(value) => setValue('buildingId', value ?? '', { shouldValidate: true })}
              hasError={Boolean(errors.buildingId)}
              hintText={errors.buildingId?.message}
              isHintAlwaysShown={Boolean(errors.buildingId)}
              disabled={!cityId}
              isLoading={isBuildingsLoading}
              fullWidth
            />
          )}
          {type === 'warehouses' && isEdit && (
            <>
              <Input
                label="Город"
                value={(record as WarehouseRecord).department_name}
                disabled
                fullWidth
                bordered
              />
              <Input
                label="Здание"
                value={(record as WarehouseRecord).subdivision_name}
                disabled
                fullWidth
                bordered
              />
            </>
          )}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                label={
                  type === 'cities'
                    ? 'Название города'
                    : type === 'buildings'
                      ? 'Название здания'
                      : type === 'cabinets'
                        ? 'Название кабинета'
                        : 'Название склада'
                }
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                hasError={Boolean(fieldState.error)}
                hintText={fieldState.error?.message}
                isHintAlwaysShown={Boolean(fieldState.error)}
                fullWidth
                bordered
              />
            )}
          />
          {type === 'buildings' && (
            <>
              <Input
                label="Ответственное лицо"
                value={responsibleText}
                onChange={(event) =>
                  setValue('responsibleText', event.target.value, { shouldValidate: true })
                }
                hasError={Boolean(errors.responsibleText)}
                hintText={errors.responsibleText?.message}
                isHintAlwaysShown={Boolean(errors.responsibleText)}
                fullWidth
                bordered
              />
              <Input
                label="CRM ID"
                value={crmId}
                onChange={(event) => setValue('crmId', event.target.value)}
                fullWidth
                bordered
              />
              <DatePicker
                label="Начало договора"
                values={startDateValue}
                onDateChange={(date) =>
                  setValue('startDate', date instanceof Date ? formatDateOnly(date) : '', {
                    shouldValidate: true,
                  })
                }
                onClear={() => setValue('startDate', '', { shouldValidate: true })}
                hasError={Boolean(errors.startDate)}
                hintText={errors.startDate?.message}
                isHintAlwaysShown={Boolean(errors.startDate)}
                allowTime={false}
                fullWidth
              />
              <DatePicker
                label="Конец договора"
                values={endDateValue}
                onDateChange={(date) =>
                  setValue('endDate', date instanceof Date ? formatDateOnly(date) : '', {
                    shouldValidate: true,
                  })
                }
                onClear={() => setValue('endDate', '', { shouldValidate: true })}
                allowTime={false}
                hasError={Boolean(errors.endDate)}
                hintText={errors.endDate?.message}
                isHintAlwaysShown={Boolean(errors.endDate)}
                fullWidth
              />
            </>
          )}
          {needsResponsible && (
            <Select
              label="Ответственное лицо"
              value={responsibleId || null}
              options={employeeOptions}
              searchValue={employeeSearch}
              onSearch={setEmployeeSearch}
              onChange={(value) =>
                setValue('responsibleId', value ?? '', { shouldValidate: true })
              }
              hasError={Boolean(errors.responsibleId)}
              hintText={errors.responsibleId?.message}
              isHintAlwaysShown={Boolean(errors.responsibleId)}
              isLoading={isEmployeesLoading}
              fullWidth
            />
          )}
          {type === 'warehouses' && !isEdit && (
            <Select
              label="Тип товара"
              value={storageTypeId || null}
              options={itemTypes.map((itemType) => ({
                label: itemType.name,
                value: String(itemType.id),
              }))}
              onChange={(value) =>
                setValue('storageTypeId', value ?? '', { shouldValidate: true })
              }
              hasError={Boolean(errors.storageTypeId)}
              hintText={errors.storageTypeId?.message}
              isHintAlwaysShown={Boolean(errors.storageTypeId)}
              isLoading={isItemTypesLoading}
              fullWidth
            />
          )}
        </Modal.Content>
        <Modal.Actions className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid}
            isLoading={isSaving}
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
