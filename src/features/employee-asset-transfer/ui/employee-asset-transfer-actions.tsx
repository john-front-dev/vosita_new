import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, OutlineFinanceWalletTransfer, OutlineSystemEdit, Select } from 'alif-ui';
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';

import { useEmployees } from '@entities/employee';
import { useBuildings, useCabinets, useCities } from '@entities/location';

import {
  type EmployeeAssetTransferFormValues,
  employeeAssetTransferSchema,
} from '../model/employee-asset-transfer-validation';
import { useEmployeeAssetTransfer } from '../model/use-employee-asset-transfer';

type Props = {
  employeeId: number | string;
  inventoryNumbers: string[];
  isSelecting: boolean;
  onSelectToggle: () => void;
  onSuccess: () => void;
};

export const EmployeeAssetTransferActions = ({
  employeeId,
  inventoryNumbers,
  isSelecting,
  onSelectToggle,
  onSuccess,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<EmployeeAssetTransferFormValues>({
    defaultValues: { buildingId: '', cabinetId: '', cityId: '', responsibleId: '' },
    mode: 'onChange',
    resolver: zodResolver(employeeAssetTransferSchema),
  });
  const { buildingId, cabinetId, cityId, responsibleId } = useWatch({ control });
  const { employees, isLoading: isEmployeesLoading } = useEmployees('', isOpen, '1,4,2');
  const { cities, isLoading: isCitiesLoading } = useCities('', isOpen);
  const { buildings, isLoading: isBuildingsLoading } = useBuildings(cityId, '', isOpen);
  const { cabinets, isLoading: isCabinetsLoading } = useCabinets(buildingId, '', isOpen);
  const { isTransferring, transfer } = useEmployeeAssetTransfer(employeeId, () => {
    setIsOpen(false);
    onSuccess();
  });

  const close = () => {
    setIsOpen(false);
    reset();
  };
  const submit: SubmitHandler<EmployeeAssetTransferFormValues> = (formValues) => {
    if (!inventoryNumbers.length) return;

    transfer({
      department_id: Number(formValues.cityId),
      inventory_number: inventoryNumbers,
      responsible_id: formValues.responsibleId,
      room_id: Number(formValues.cabinetId),
      subdivision_id: Number(formValues.buildingId),
    });
  };

  return (
    <>
      <div className="flex flex-wrap justify-start gap-3">
        <Button
          type="button"
          variant="outline-neutral"
          leftSection={<OutlineSystemEdit />}
          onClick={onSelectToggle}
        >
          {isSelecting ? 'Отмена' : 'Выбрать'}
        </Button>
        <Button
          type="button"
          variant="primary"
          leftSection={<OutlineFinanceWalletTransfer />}
          disabled={!isSelecting || !inventoryNumbers.length}
          onClick={() => {
            reset();
            setIsOpen(true);
          }}
        >
          Передать ОС
        </Button>
      </div>

      <Modal className="w-140" isOpen={isOpen} onClose={close} isCentered withCloseButton>
        <Modal.Header title="Передать ОС" />
        <Modal.Content className="flex flex-col gap-4">
          <Select
            label="Ответственное лицо"
            value={responsibleId || null}
            options={employees.map((employee) => ({
              label: employee.full_name,
              value: String(employee.id),
            }))}
            onChange={(value) =>
              setValue('responsibleId', value ?? '', {
                shouldValidate: true,
              })
            }
            isLoading={isEmployeesLoading}
            fullWidth
          />
          <Select
            label="Город"
            value={cityId || null}
            options={cities.map((city) => ({ label: city.name, value: String(city.id) }))}
            onChange={(value) => {
              setValue('cityId', value ?? '', { shouldValidate: true });
              setValue('buildingId', '', { shouldValidate: true });
              setValue('cabinetId', '', { shouldValidate: true });
            }}
            isLoading={isCitiesLoading}
            fullWidth
          />
          <Select
            label="Здание"
            value={buildingId || null}
            options={buildings.map((building) => ({
              label: building.name ?? building.build ?? '',
              value: String(building.id),
            }))}
            onChange={(value) => {
              setValue('buildingId', value ?? '', { shouldValidate: true });
              setValue('cabinetId', '', { shouldValidate: true });
            }}
            isLoading={isBuildingsLoading}
            disabled={!cityId}
            fullWidth
          />
          <Select
            label="Кабинет"
            value={cabinetId || null}
            options={cabinets.map((cabinet) => ({
              label: cabinet.room,
              value: String(cabinet.id),
            }))}
            onChange={(value) => setValue('cabinetId', value ?? '', { shouldValidate: true })}
            isLoading={isCabinetsLoading}
            disabled={!buildingId}
            fullWidth
          />
        </Modal.Content>
        <Modal.Actions className="flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={close}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!isValid || isTransferring}
            isLoading={isTransferring}
            onClick={handleSubmit(submit)}
          >
            Переместить
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
