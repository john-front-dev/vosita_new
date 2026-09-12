import { useState } from 'react';
import {
  Button,
  Modal,
  OutlineFinanceWalletTransfer,
  OutlineSystemEdit,
  Select,
} from 'alif-ui';

import { useEmployees } from '@entities/employee';
import { useBuildings, useCabinets, useCities } from '@entities/location';
import { normalizeSelectValue } from '@shared/lib';

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
  const [responsibleId, setResponsibleId] = useState('');
  const [cityId, setCityId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [cabinetId, setCabinetId] = useState('');
  const { employees, isLoading: isEmployeesLoading } = useEmployees('', isOpen, '1,4,2');
  const { cities, isLoading: isCitiesLoading } = useCities('', isOpen);
  const { buildings, isLoading: isBuildingsLoading } = useBuildings(cityId, '', isOpen);
  const { cabinets, isLoading: isCabinetsLoading } = useCabinets(buildingId, '', isOpen);
  const transfer = useEmployeeAssetTransfer(employeeId, () => {
    setIsOpen(false);
    onSuccess();
  });
  const isFormInvalid = !responsibleId || !cityId || !buildingId || !cabinetId;

  const resetForm = () => {
    setResponsibleId('');
    setCityId('');
    setBuildingId('');
    setCabinetId('');
  };
  const close = () => {
    setIsOpen(false);
    resetForm();
  };
  const submit = () => {
    if (isFormInvalid || !inventoryNumbers.length) return;

    transfer.transfer({
      department_id: Number(cityId),
      inventory_number: inventoryNumbers,
      responsible_id: responsibleId,
      room_id: Number(cabinetId),
      subdivision_id: Number(buildingId),
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
            resetForm();
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
            onChange={(value) => setResponsibleId(normalizeSelectValue(value))}
            isLoading={isEmployeesLoading}
            fullWidth
          />
          <Select
            label="Город"
            value={cityId || null}
            options={cities.map((city) => ({ label: city.name, value: String(city.id) }))}
            onChange={(value) => {
              setCityId(normalizeSelectValue(value));
              setBuildingId('');
              setCabinetId('');
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
              setBuildingId(normalizeSelectValue(value));
              setCabinetId('');
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
            onChange={(value) => setCabinetId(normalizeSelectValue(value))}
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
            disabled={isFormInvalid || transfer.isTransferring}
            isLoading={transfer.isTransferring}
            onClick={submit}
          >
            Переместить
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
