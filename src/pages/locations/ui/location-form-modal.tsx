import { useMemo, useState } from 'react';
import { Button, DatePicker, Input, Modal, Select, snackbar } from 'alif-ui';

import { useMutationQuery } from '@shared/api';
import { formatDateOnly, normalizeSelectValue, parseDateOnly } from '@shared/lib';

import { locationsEndpoints } from '../api/locations-api';
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

type LocationFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: LocationRecord | null;
  type: LocationType;
};

type LocationMutationVariables = { body: Record<string, unknown>; url: string };

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

const getEndpoint = (type: LocationType, record: LocationRecord | null) => {
  if (!record) {
    return {
      cities: locationsEndpoints.createCity,
      buildings: locationsEndpoints.createBuilding,
      cabinets: locationsEndpoints.createCabinet,
      warehouses: locationsEndpoints.createWarehouse,
    }[type];
  }
  return {
    cities: locationsEndpoints.editCity,
    buildings: locationsEndpoints.editBuilding,
    cabinets: locationsEndpoints.editCabinet,
    warehouses: locationsEndpoints.editWarehouse,
  }[type](record.id);
};

const getBody = (type: LocationType, values: LocationFormValues, isEdit: boolean) => {
  if (type === 'cities') return { region: values.name.trim() };
  if (type === 'buildings') {
    return {
      crm_id: values.crmId.trim(),
      end_date: new Date(values.endDate).toISOString(),
      filial_id: Number(values.cityId),
      name: values.name.trim(),
      responsible: values.responsibleText.trim(),
      start_date: new Date(values.startDate).toISOString(),
    };
  }
  if (type === 'cabinets') {
    return {
      department_id: Number(values.cityId),
      name_room: values.name.trim(),
      subdivision_id: Number(values.buildingId),
      ...(!isEdit && values.responsibleId ? { responsible_id: values.responsibleId } : {}),
    };
  }
  if (isEdit) {
    return { name: values.name.trim(), responsible_id: values.responsibleId };
  }
  return {
    department_id: Number(values.cityId),
    name: values.name.trim(),
    responsible_id: values.responsibleId || undefined,
    storage_type_id: Number(values.storageTypeId),
    subdivision_id: Number(values.buildingId),
  };
};

const isFormValid = (type: LocationType, values: LocationFormValues, isEdit: boolean) => {
  if (!values.name.trim()) return false;
  if (type === 'cities') return true;
  if (!values.cityId) return false;
  if (type === 'buildings') {
    const startDate = parseDateOnly(values.startDate);
    const endDate = parseDateOnly(values.endDate);

    return Boolean(values.responsibleText.trim() && startDate && endDate && startDate <= endDate);
  }
  if (!values.buildingId) return false;
  if (type === 'cabinets') return isEdit || Boolean(values.responsibleId);
  return isEdit ? Boolean(values.responsibleId) : Boolean(values.storageTypeId);
};

export const LocationFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  record,
  type,
}: LocationFormModalProps) => {
  const isEdit = Boolean(record);
  const [values, setValues] = useState(() => getInitialForm(type, record));
  const [employeeSearch, setEmployeeSearch] = useState('');
  const needsHierarchy = type !== 'cities' && !(type === 'warehouses' && isEdit);
  const needsResponsible = (type === 'cabinets' && !isEdit) || type === 'warehouses';
  const citiesQuery = useLocationFormCities(isOpen && needsHierarchy);
  const buildingsQuery = useLocationFormBuildings(values.cityId, isOpen && needsHierarchy);
  const employeesQuery = useResponsiblePeople(
    employeeSearch,
    type === 'cabinets' ? '1,4' : '1,2',
    isOpen && needsResponsible,
  );
  const itemTypesQuery = useItemTypes(isOpen && type === 'warehouses' && !isEdit);
  const endpoint = getEndpoint(type, record);
  const mutationOptions = {
    onSuccess: () => {
      snackbar.show({
        title: isEdit ? 'Изменения сохранены' : 'Местоположение добавлено',
        type: 'success',
      });
      onSuccess();
      onClose();
    },
  };
  const postMutation = useMutationQuery<ApiResponse<unknown>, LocationMutationVariables>({
    method: 'post',
    url: endpoint,
    options: mutationOptions,
  });
  const putMutation = useMutationQuery<ApiResponse<unknown>, LocationMutationVariables>({
    method: 'put',
    url: endpoint,
    options: mutationOptions,
  });
  const isSubmitting = postMutation.isPending || putMutation.isPending;
  const startDate = parseDateOnly(values.startDate);
  const endDate = parseDateOnly(values.endDate);
  const hasInvalidDateRange = Boolean(startDate && endDate && startDate > endDate);
  const update = (patch: Partial<LocationFormValues>) =>
    setValues((current) => ({ ...current, ...patch }));
  const cityOptions = useMemo(
    () => citiesQuery.cities.map((city) => ({ label: city.name, value: String(city.id) })),
    [citiesQuery.cities],
  );
  const buildingOptions = useMemo(
    () =>
      buildingsQuery.buildings.map((building) => ({
        label: building.name,
        value: String(building.id),
      })),
    [buildingsQuery.buildings],
  );
  const employeeOptions = useMemo(() => {
    const options = employeesQuery.employees.map((employee) => ({
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
  }, [employeesQuery.employees, record, type]);

  const handleClose = () => {
    setValues(getInitialForm(type, record));
    onClose();
  };

  return (
    <Modal className="w-130" isOpen={isOpen} onClose={handleClose} isCentered withCloseButton>
      <Modal.Header
        title={`${isEdit ? 'Изменить' : 'Добавить'} ${locationTypeLabels[type].singular}`}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!isFormValid(type, values, isEdit)) return;
          const variables = { body: getBody(type, values, isEdit), url: endpoint };
          if (isEdit && (type === 'cabinets' || type === 'warehouses')) {
            putMutation.mutate(variables);
          } else {
            postMutation.mutate(variables);
          }
        }}
      >
        <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          {needsHierarchy && (
            <Select
              label="Город"
              value={values.cityId || null}
              options={cityOptions}
              onChange={(value) => update({ cityId: normalizeSelectValue(value), buildingId: '' })}
              isLoading={citiesQuery.isLoading}
              fullWidth
            />
          )}
          {needsHierarchy && type !== 'buildings' && (
            <Select
              label="Здание"
              value={values.buildingId || null}
              options={buildingOptions}
              onChange={(value) => update({ buildingId: normalizeSelectValue(value) })}
              disabled={!values.cityId}
              isLoading={buildingsQuery.isLoading}
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
            value={values.name}
            onChange={(event) => update({ name: event.target.value })}
            fullWidth
            bordered
          />
          {type === 'buildings' && (
            <>
              <Input
                label="Ответственное лицо"
                value={values.responsibleText}
                onChange={(event) => update({ responsibleText: event.target.value })}
                fullWidth
                bordered
              />
              <Input
                label="CRM ID"
                value={values.crmId}
                onChange={(event) => update({ crmId: event.target.value })}
                fullWidth
                bordered
              />
              <DatePicker
                label="Начало договора"
                values={startDate}
                onDateChange={(date) =>
                  update({ startDate: date instanceof Date ? formatDateOnly(date) : '' })
                }
                onClear={() => update({ startDate: '' })}
                allowTime={false}
                fullWidth
              />
              <DatePicker
                label="Конец договора"
                values={endDate}
                onDateChange={(date) =>
                  update({ endDate: date instanceof Date ? formatDateOnly(date) : '' })
                }
                onClear={() => update({ endDate: '' })}
                allowTime={false}
                hasError={hasInvalidDateRange}
                hintText={
                  hasInvalidDateRange
                    ? 'Дата окончания должна быть не раньше даты начала'
                    : undefined
                }
                isHintAlwaysShown={hasInvalidDateRange}
                fullWidth
              />
            </>
          )}
          {needsResponsible && (
            <Select
              label="Ответственное лицо"
              value={values.responsibleId || null}
              options={employeeOptions}
              searchValue={employeeSearch}
              onSearch={setEmployeeSearch}
              onChange={(value) => update({ responsibleId: normalizeSelectValue(value) })}
              isLoading={employeesQuery.isLoading}
              fullWidth
            />
          )}
          {type === 'warehouses' && !isEdit && (
            <Select
              label="Тип товара"
              value={values.storageTypeId || null}
              options={itemTypesQuery.itemTypes.map((itemType) => ({
                label: itemType.name,
                value: String(itemType.id),
              }))}
              onChange={(value) => update({ storageTypeId: normalizeSelectValue(value) })}
              isLoading={itemTypesQuery.isLoading}
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
            disabled={!isFormValid(type, values, isEdit)}
            isLoading={isSubmitting}
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
