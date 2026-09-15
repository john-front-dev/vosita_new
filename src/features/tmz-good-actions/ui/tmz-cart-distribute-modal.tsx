import { useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from 'alif-ui';

import { useCategories, useMbpCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import type { TmzCartItem, TmzGoodOperationPayload } from '@entities/tmz-good';
import { normalizeSelectValue } from '@shared/lib';

import { useTmzGoodOperation } from '../model/use-tmz-good-mutations';
import { TmzCartCabinetSelect } from './tmz-cart-cabinet-select';

type PartyField = {
  categoryId: string;
  exploiterId: string;
  responsibleId: string;
  serialNumber: string;
};

type Props = {
  items: TmzCartItem[];
  onClose: () => void;
  onSuccess: () => void;
};

export const TmzCartDistributeModal = ({ items, onClose, onSuccess }: Props) => {
  const [cabinetBySubdivision, setCabinetBySubdivision] = useState<Record<number, string>>({});
  const firstItem = items[0];
  const isTmz = firstItem?.item_type_name === 'ТМЗ';
  const isMbp = firstItem?.item_type_name === 'МБП';
  const [partyFields, setPartyFields] = useState<Record<number, PartyField[]>>(() => {
    if (isTmz) return {};
    return Object.fromEntries(
      items.map((item) => [
        item.id,
        Array.from({ length: item.qty }, () => ({
          categoryId: '',
          exploiterId: '',
          responsibleId: '',
          serialNumber: '',
        })),
      ]),
    );
  });
  const { employees } = useEmployees('', !isTmz);
  const { categories: fixedAssetCategories } = useCategories('', !isTmz && !isMbp);
  const { categories: mbpCategories } = useMbpCategories('', !isTmz && isMbp);
  const { isPending, mutate } = useTmzGoodOperation('cart', undefined, onSuccess);
  const sourceSubdivisions = useMemo(
    () =>
      items.filter(
        (item, index, list) =>
          list.findIndex((candidate) => candidate.subdivision_id === item.subdivision_id) === index,
      ),
    [items],
  );
  const categories = isMbp ? mbpCategories : fixedAssetCategories;

  const updatePartyField = (itemId: number, index: number, patch: Partial<PartyField>) =>
    setPartyFields((current) => ({
      ...current,
      [itemId]: current[itemId].map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field,
      ),
    }));

  const hasInvalidPartyFields = Object.values(partyFields)
    .flat()
    .some(
      (field) =>
        !field.categoryId ||
        !field.exploiterId ||
        !field.responsibleId ||
        (!isMbp && !field.serialNumber.trim()),
    );
  const hasInvalidCabinets = sourceSubdivisions.some(
    (item) => !cabinetBySubdivision[item.subdivision_id],
  );

  const submit = () => {
    if (hasInvalidCabinets || hasInvalidPartyFields) return;
    const body: TmzGoodOperationPayload[] = items.map((item) => ({
      from_department: item.department_id,
      from_storage: item.warehouse_id,
      from_subdivision: item.subdivision_id,
      goods_id: item.good_id,
      operation_type: 'расход',
      qty: item.qty,
      to_cabinet: Number(cabinetBySubdivision[item.subdivision_id]),
      ...(!isTmz && {
        party_items: partyFields[item.id].map((field) => ({
          amortization_cat_id: Number(field.categoryId),
          exploiter_id: field.exploiterId,
          responsible_id: field.responsibleId,
          ...(field.serialNumber.trim() && { serial_number: field.serialNumber.trim() }),
        })),
      }),
    }));
    mutate({ body });
  };

  return (
    <Modal className="w-150" isOpen onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Распределить выбранные товары" />
      <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border border-(--color-border-default) p-4"
          >
            <div className="font-medium">{item.name}</div>
            <Input label="Город" value={item.department_name} disabled fullWidth bordered />
            <Input label="Здание" value={item.subdivision_name} disabled fullWidth bordered />
            <TmzCartCabinetSelect
              cabinetId={cabinetBySubdivision[item.subdivision_id] ?? ''}
              subdivisionId={item.subdivision_id}
              onChange={(value) =>
                setCabinetBySubdivision((current) => ({
                  ...current,
                  [item.subdivision_id]: value,
                }))
              }
            />
            <Input
              label="Количество"
              value={`${item.qty} ${item.unit}`}
              disabled
              fullWidth
              bordered
            />
          </div>
        ))}

        {!isTmz &&
          items.flatMap((item) =>
            (partyFields[item.id] ?? []).map((field, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex flex-col gap-3 rounded-lg border border-(--color-border-default) p-4"
              >
                <div className="font-medium">
                  {item.name} — единица {index + 1}
                </div>
                <Select
                  label="Категория амортизации"
                  value={field.categoryId || null}
                  options={categories.map((category) => ({
                    label: category.name,
                    value: String(category.id),
                  }))}
                  onChange={(value) =>
                    updatePartyField(item.id, index, {
                      categoryId: normalizeSelectValue(value),
                    })
                  }
                  fullWidth
                />
                {!isMbp && (
                  <Input
                    label="Серийный номер"
                    value={field.serialNumber}
                    onChange={(event) =>
                      updatePartyField(item.id, index, { serialNumber: event.target.value })
                    }
                    fullWidth
                    bordered
                  />
                )}
                <Select
                  label="Ответственное лицо"
                  value={field.responsibleId || null}
                  options={employees.map((employee) => ({
                    label: employee.full_name,
                    value: String(employee.id),
                  }))}
                  onChange={(value) =>
                    updatePartyField(item.id, index, {
                      responsibleId: normalizeSelectValue(value),
                    })
                  }
                  fullWidth
                />
                <Select
                  label="Пользователь"
                  value={field.exploiterId || null}
                  options={employees.map((employee) => ({
                    label: employee.full_name,
                    value: String(employee.id),
                  }))}
                  onChange={(value) =>
                    updatePartyField(item.id, index, {
                      exploiterId: normalizeSelectValue(value),
                    })
                  }
                  fullWidth
                />
              </div>
            )),
          )}
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-3">
        <Button type="button" variant="outline-neutral" onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={hasInvalidCabinets || hasInvalidPartyFields}
          isLoading={isPending}
          onClick={submit}
        >
          Распределить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
