import { useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from 'alif-ui';

import { useAllWarehouses, useBuildings, useCities } from '@entities/location';
import type { TmzGoodOperationPayload, TmzGoodRemain } from '@entities/tmz-good';
import { normalizeSelectValue } from '@shared/lib';

import { useTmzGoodOperation } from '../model/use-tmz-good-mutations';

type Props = {
  goodsId: number;
  isOpen: boolean;
  onClose: () => void;
  remains: TmzGoodRemain[];
  storageId: number;
};

export const TmzGoodMoveModal = ({ goodsId, isOpen, onClose, remains, storageId }: Props) => {
  const [quantity, setQuantity] = useState('1');
  const [cityId, setCityId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const remain = remains[0];
  const amount = Number(quantity);
  const citiesQuery = useCities('', isOpen);
  const buildingsQuery = useBuildings(cityId, '', isOpen);
  const warehousesQuery = useAllWarehouses(isOpen && Boolean(buildingId));
  const operation = useTmzGoodOperation('move', goodsId, onClose);
  const targetWarehouses = useMemo(
    () =>
      warehousesQuery.warehouses.filter((warehouse) =>
        buildingId
          ? Number(warehouse.subdivision_id ?? warehouse.sub_id) === Number(buildingId)
          : true,
      ),
    [buildingId, warehousesQuery.warehouses],
  );
  const hasInvalidQuantity = !remain || !amount || amount <= 0 || amount > remain.total_qty;
  const isInvalid = !cityId || !buildingId || !warehouseId || hasInvalidQuantity;

  const changeQuantity = (rawValue: string) =>
    setQuantity(rawValue.replace(',', '.').replace(/[^0-9.]/g, ''));

  const submit = () => {
    if (!remain || isInvalid) return;
    const body: TmzGoodOperationPayload = {
      from_department: remain.from_department,
      from_storage: Number(remain.from_storage || storageId),
      from_subdivision: remain.from_subdivision,
      goods_id: goodsId,
      operation_type: 'перемещение',
      qty: amount,
      to_department: Number(cityId),
      to_storage: Number(warehouseId),
      to_subdivision: Number(buildingId),
    };
    operation.mutate({ body });
  };

  return (
    <Modal
      className="w-150"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      withCloseButton
    >
      <Modal.Header title="Переместить партию" />
      <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        <Input
          label="Из города"
          value={remain?.from_department_name ?? ''}
          disabled
          fullWidth
          bordered
        />
        <Input
          label="Из здания"
          value={remain?.from_subdivision_name ?? ''}
          disabled
          fullWidth
          bordered
        />
        <Input
          label="Из склада"
          value={remain?.from_storage_name ?? ''}
          disabled
          fullWidth
          bordered
        />
        <Select
          label="В город"
          value={cityId || null}
          options={citiesQuery.cities.map((city) => ({
            label: city.name,
            value: String(city.id),
          }))}
          onChange={(value) => {
            setCityId(normalizeSelectValue(value));
            setBuildingId('');
            setWarehouseId('');
          }}
          isLoading={citiesQuery.isLoading}
          fullWidth
        />
        <Select
          label="В здание"
          value={buildingId || null}
          options={buildingsQuery.buildings.map((building) => ({
            label: building.name ?? building.build ?? '',
            value: String(building.id),
          }))}
          onChange={(value) => {
            setBuildingId(normalizeSelectValue(value));
            setWarehouseId('');
          }}
          isLoading={buildingsQuery.isLoading}
          disabled={!cityId}
          fullWidth
        />
        <Select
          label="В склад"
          value={warehouseId || null}
          options={targetWarehouses.map((warehouse) => ({
            label: warehouse.storage_name ?? warehouse.name ?? '',
            value: String(warehouse.storage_id ?? warehouse.id),
          }))}
          onChange={(value) => setWarehouseId(normalizeSelectValue(value))}
          isLoading={warehousesQuery.isLoading}
          disabled={!buildingId}
          fullWidth
        />
        <Input
          label={`Количество (доступно: ${remain?.total_qty ?? 0} ${remain?.unit ?? ''})`}
          value={quantity}
          onChange={(event) => changeQuantity(event.target.value)}
          hasError={hasInvalidQuantity}
          hintText={hasInvalidQuantity ? 'Укажите доступное количество больше нуля' : undefined}
          isHintAlwaysShown={hasInvalidQuantity}
          fullWidth
          bordered
        />
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-3">
        <Button type="button" variant="outline-neutral" onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={isInvalid || operation.isPending}
          isLoading={operation.isPending}
          onClick={submit}
        >
          Переместить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
