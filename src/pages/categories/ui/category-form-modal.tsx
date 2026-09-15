import { useState } from 'react';
import { Button, Input, Modal, Select, Switch } from 'alif-ui';

import { normalizeSelectValue } from '@shared/lib';

import { taxGroupOptions } from '../model/category-tabs';
import type { CategoryRecord, CategoryType, MbpCategory, OsCategory } from '../model/types';
import { useSaveCategory } from '../model/use-category-mutations';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  record: CategoryRecord | null;
  type: Exclude<CategoryType, 'tmz'>;
};

const normalizeNumber = (value: string) => value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

export const CategoryFormModal = ({ isOpen, onClose, record, type }: Props) => {
  const isEdit = Boolean(record);
  const osRecord = type === 'os' && record ? (record as OsCategory) : null;
  const mbpRecord = type === 'mbp' && record ? (record as MbpCategory) : null;
  const [name, setName] = useState(record?.name ?? '');
  const [depreciationRate, setDepreciationRate] = useState(
    osRecord ? String(osRecord.depreciation_rate) : '0',
  );
  const [taxGroupId, setTaxGroupId] = useState(osRecord ? String(osRecord.tax_group_id) : '1');
  const [isDestroyable, setIsDestroyable] = useState(mbpRecord?.is_destroyable ?? false);
  const { isSaving, save } = useSaveCategory(() => {
    onClose();
  });
  const isValid =
    name.trim().length > 0 &&
    (type === 'mbp' || (Number(depreciationRate) > 0 && Boolean(taxGroupId)));

  const submit = async () => {
    if (!isValid) return;
    await save(
      type,
      mbpRecord,
      {
        depreciationRate: Number(depreciationRate),
        isDestroyable,
        name: name.trim(),
        taxGroupId: Number(taxGroupId),
      },
      record?.id,
    );
  };

  return (
    <Modal className="w-125" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title={isEdit ? 'Редактирование категории' : 'Добавление категории'} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Modal.Content className="flex flex-col gap-4">
          <Input
            label="Название категории"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            bordered
          />
          {type === 'os' && (
            <>
              <Input
                label="Норма (%)"
                value={depreciationRate}
                onChange={(event) => setDepreciationRate(normalizeNumber(event.target.value))}
                fullWidth
                bordered
              />
              <Select
                label="Тип налога"
                value={taxGroupId}
                options={taxGroupOptions}
                onChange={(value) => setTaxGroupId(normalizeSelectValue(value))}
                fullWidth
              />
            </>
          )}
          {type === 'mbp' && (
            <Switch
              label="Подлежит уничтожению"
              checked={isDestroyable}
              onChange={(event) => setIsDestroyable(event.target.checked)}
              size="m"
            />
          )}
        </Modal.Content>
        <Modal.Actions className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid} isLoading={isSaving}>
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
