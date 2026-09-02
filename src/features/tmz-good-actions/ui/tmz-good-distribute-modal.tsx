import { useState } from 'react';
import { Button, Input, Modal, Select } from 'alif-ui';

import { useCategories, useMbpCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { useCabinets } from '@entities/location';
import type { TmzGoodOperationPayload, TmzGoodRemain } from '@entities/tmz-good';
import { normalizeSelectValue } from '@shared/lib';

import { useTmzGoodOperation } from '../model/use-tmz-good-mutations';

type PartyItem = {
  amortizationCategoryId: string;
  exploiterId: string;
  responsibleId: string;
  serialNumber: string;
};

type Props = {
  goodsId: number;
  isOpen: boolean;
  onClose: () => void;
  remains: TmzGoodRemain[];
  storageId: number;
};

const emptyPartyItem = (): PartyItem => ({
  amortizationCategoryId: '',
  exploiterId: '',
  responsibleId: '',
  serialNumber: '',
});

export const TmzGoodDistributeModal = ({
  goodsId,
  isOpen,
  onClose,
  remains,
  storageId,
}: Props) => {
  const remain = remains[0];
  const [quantity, setQuantity] = useState('1');
  const [cabinetId, setCabinetId] = useState('');
  const isTmz = remain?.item_type_name === 'ТМЗ';
  const isMbp = remain?.item_type_name === 'МБП';
  const needsPartyItems = !isTmz;
  const [partyItems, setPartyItems] = useState<PartyItem[]>(() =>
    needsPartyItems ? [emptyPartyItem()] : [],
  );
  const amount = Number(quantity);
  const { cabinets, isLoading: isCabinetsLoading } = useCabinets(
    String(remain?.from_subdivision ?? ''),
    '',
    isOpen,
  );
  const { categories: fixedAssetCategories } = useCategories(
    '',
    isOpen && needsPartyItems && !isMbp,
  );
  const { categories: mbpCategories } = useMbpCategories(
    '',
    isOpen && needsPartyItems && isMbp,
  );
  const { employees } = useEmployees('', isOpen && needsPartyItems);
  const operation = useTmzGoodOperation('distribute', goodsId, onClose);
  const categories = isMbp ? mbpCategories : fixedAssetCategories;

  const changeQuantity = (rawValue: string) => {
    const normalized = rawValue.replace(',', '.').replace(/[^0-9.]/g, '');
    const nextAmount = Number(normalized);
    setQuantity(normalized);
    setPartyItems((previous) =>
      needsPartyItems && Number.isInteger(nextAmount) && nextAmount > 0
        ? Array.from({ length: nextAmount }, (_, index) => previous[index] ?? emptyPartyItem())
        : [],
    );
  };

  const updatePartyItem = (index: number, patch: Partial<PartyItem>) =>
    setPartyItems((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );

  const hasInvalidQuantity = !remain || !amount || amount <= 0 || amount > remain.total_qty;
  const hasInvalidPartyItems =
    needsPartyItems &&
    (partyItems.length !== amount ||
      partyItems.some(
        (item) =>
          !item.amortizationCategoryId ||
          !item.exploiterId ||
          !item.responsibleId ||
          (!isMbp && !item.serialNumber.trim()),
      ));
  const isInvalid = !cabinetId || hasInvalidQuantity || hasInvalidPartyItems;

  const submit = () => {
    if (!remain || isInvalid) return;
    const body: TmzGoodOperationPayload = {
      from_department: remain.from_department,
      from_storage: Number(remain.from_storage || storageId),
      from_subdivision: remain.from_subdivision,
      goods_id: goodsId,
      operation_type: 'расход',
      qty: amount,
      to_cabinet: Number(cabinetId),
      ...(needsPartyItems && {
        party_items: partyItems.map((item) => ({
          amortization_cat_id: Number(item.amortizationCategoryId),
          exploiter_id: item.exploiterId,
          responsible_id: item.responsibleId,
          ...(item.serialNumber.trim() && { serial_number: item.serialNumber.trim() }),
        })),
      }),
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
      <Modal.Header title="Распределить партию" />
      <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        <Input
          label="Город"
          value={remain?.from_department_name ?? ''}
          disabled
          fullWidth
          bordered
        />
        <Input
          label="Здание"
          value={remain?.from_subdivision_name ?? ''}
          disabled
          fullWidth
          bordered
        />
        <Select
          label="В кабинет"
          value={cabinetId || null}
          options={cabinets.map((cabinet) => ({
            label: cabinet.room,
            value: String(cabinet.id),
          }))}
          onChange={(value) => setCabinetId(normalizeSelectValue(value))}
          isLoading={isCabinetsLoading}
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

        {needsPartyItems &&
          partyItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-(--color-border-default) p-4"
            >
              <div className="font-medium">
                {remain?.name} — единица {index + 1}
              </div>
              <Select
                label="Категория амортизации"
                value={item.amortizationCategoryId || null}
                options={categories.map((category) => ({
                  label: category.name,
                  value: String(category.id),
                }))}
                onChange={(value) =>
                  updatePartyItem(index, {
                    amortizationCategoryId: normalizeSelectValue(value),
                  })
                }
                fullWidth
              />
              {!isMbp && (
                <Input
                  label="Серийный номер"
                  value={item.serialNumber}
                  onChange={(event) =>
                    updatePartyItem(index, { serialNumber: event.target.value })
                  }
                  fullWidth
                  bordered
                />
              )}
              <Select
                label="Ответственное лицо"
                value={item.responsibleId || null}
                options={employees.map((employee) => ({
                  label: employee.full_name,
                  value: String(employee.id),
                }))}
                onChange={(value) =>
                  updatePartyItem(index, { responsibleId: normalizeSelectValue(value) })
                }
                fullWidth
              />
              <Select
                label="Пользователь"
                value={item.exploiterId || null}
                options={employees.map((employee) => ({
                  label: employee.full_name,
                  value: String(employee.id),
                }))}
                onChange={(value) =>
                  updatePartyItem(index, { exploiterId: normalizeSelectValue(value) })
                }
                fullWidth
              />
            </div>
          ))}
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
          Распределить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
