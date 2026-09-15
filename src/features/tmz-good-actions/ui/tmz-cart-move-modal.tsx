import { useState } from 'react';
import { Button, Modal, Select } from 'alif-ui';

import { useAllWarehouses, useBuildings, useCities } from '@entities/location';
import type { TmzCartItem, TmzGoodOperationPayload } from '@entities/tmz-good';
import { normalizeSelectValue } from '@shared/lib';

import { useTmzGoodOperation } from '../model/use-tmz-good-mutations';

type Props = {
  items: TmzCartItem[];
  onClose: () => void;
  onSuccess: () => void;
};

export const TmzCartMoveModal = ({ items, onClose, onSuccess }: Props) => {
  const [cityId, setCityId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const { cities, isLoading: isCitiesLoading } = useCities('');
  const { buildings, isLoading: isBuildingsLoading } = useBuildings(cityId);
  const { warehouses, isLoading: isWarehousesLoading } = useAllWarehouses(Boolean(buildingId));
  const { isPending, mutate } = useTmzGoodOperation('cart', undefined, onSuccess);
  const targetWarehouses = warehouses.filter(
    (warehouse) => warehouse.subdivision_id === Number(buildingId),
  );
  const isInvalid = !cityId || !buildingId || !warehouseId;

  const submit = () => {
    if (isInvalid) return;
    const body: TmzGoodOperationPayload[] = items.map((item) => ({
      from_department: item.department_id,
      from_storage: item.warehouse_id,
      from_subdivision: item.subdivision_id,
      goods_id: item.good_id,
      operation_type: 'перемещение',
      qty: item.qty,
      to_department: Number(cityId),
      to_storage: Number(warehouseId),
      to_subdivision: Number(buildingId),
    }));
    mutate({ body });
  };

  return (
    <Modal className="w-150" isOpen onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Переместить выбранные товары" />
      <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        <Select
          label="В город"
          value={cityId || null}
          options={cities.map((city) => ({
            label: city.name,
            value: String(city.id),
          }))}
          onChange={(value) => {
            setCityId(normalizeSelectValue(value));
            setBuildingId('');
            setWarehouseId('');
          }}
          isLoading={isCitiesLoading}
          fullWidth
        />
        <Select
          label="В здание"
          value={buildingId || null}
          options={buildings.map((building) => ({
            label: building.name ?? building.build ?? '',
            value: String(building.id),
          }))}
          onChange={(value) => {
            setBuildingId(normalizeSelectValue(value));
            setWarehouseId('');
          }}
          isLoading={isBuildingsLoading}
          disabled={!cityId}
          fullWidth
        />
        <Select
          label="В склад"
          value={warehouseId || null}
          options={targetWarehouses.map((warehouse) => ({
            label: warehouse.storage_name,
            value: String(warehouse.storage_id),
          }))}
          onChange={(value) => setWarehouseId(normalizeSelectValue(value))}
          isLoading={isWarehousesLoading}
          disabled={!buildingId}
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
          disabled={isInvalid}
          isLoading={isPending}
          onClick={submit}
        >
          Переместить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
