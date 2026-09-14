import { useState } from 'react';
import { Button, Input, Modal, Select, snackbar, Switch } from 'alif-ui';

import { httpClient } from '@shared/api';
import { normalizeSelectValue } from '@shared/lib';

import { categoriesEndpoints } from '../api/categories-api';
import { taxGroupOptions } from '../model/category-tabs';
import type { CategoryRecord, CategoryType, MbpCategory, OsCategory } from '../model/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: CategoryRecord | null;
  type: Exclude<CategoryType, 'tmz'>;
};

const normalizeNumber = (value: string) => value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

export const CategoryFormModal = ({ isOpen, onClose, onSuccess, record, type }: Props) => {
  const isEdit = Boolean(record);
  const osRecord = type === 'os' && record ? (record as OsCategory) : null;
  const mbpRecord = type === 'mbp' && record ? (record as MbpCategory) : null;
  const [name, setName] = useState(record?.name ?? '');
  const [depreciationRate, setDepreciationRate] = useState(
    osRecord ? String(osRecord.depreciation_rate) : '0',
  );
  const [taxGroupId, setTaxGroupId] = useState(osRecord ? String(osRecord.tax_group_id) : '1');
  const [isDestroyable, setIsDestroyable] = useState(mbpRecord?.is_destroyable ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid =
    name.trim().length > 0 &&
    (type === 'mbp' || (Number(depreciationRate) > 0 && Boolean(taxGroupId)));

  const submit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      if (type === 'os') {
        const body = {
          depreciation_rate: Number(depreciationRate),
          name: name.trim(),
          parent_id: Number(taxGroupId),
        };
        await (isEdit
          ? httpClient.post<ApiResponse<unknown>>(categoriesEndpoints.editOs(record!.id), body)
          : httpClient.post<ApiResponse<unknown>>(categoriesEndpoints.createOs, body));
      } else if (!isEdit) {
        await httpClient.post<ApiResponse<unknown>>(categoriesEndpoints.createMbp, {
          is_destroyable: isDestroyable,
          name: name.trim(),
        });
      } else {
        if (name.trim() !== mbpRecord?.name) {
          await httpClient.put<ApiResponse<unknown>>(categoriesEndpoints.updateMbp(record!.id), {
            id: record!.id,
            name: name.trim(),
          });
        }
        if (isDestroyable !== mbpRecord?.is_destroyable) {
          await httpClient.put<ApiResponse<unknown>>(categoriesEndpoints.updateMbpStatus(record!.id), {
            id: record!.id,
            is_destroyable: isDestroyable,
          });
        }
      }
      snackbar.show({ title: isEdit ? 'Категория обновлена' : 'Категория добавлена', type: 'success' });
      onSuccess();
      onClose();
    } catch {
      snackbar.show({ title: 'Не удалось сохранить категорию', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal className="w-125" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title={isEdit ? 'Редактирование категории' : 'Добавление категории'} />
      <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <Modal.Content className="flex flex-col gap-4">
          <Input label="Название категории" value={name} onChange={(event) => setName(event.target.value)} fullWidth bordered />
          {type === 'os' && (
            <>
              <Input label="Норма (%)" value={depreciationRate} onChange={(event) => setDepreciationRate(normalizeNumber(event.target.value))} fullWidth bordered />
              <Select label="Тип налога" value={taxGroupId} options={taxGroupOptions} onChange={(value) => setTaxGroupId(normalizeSelectValue(value))} fullWidth />
            </>
          )}
          {type === 'mbp' && (
            <Switch label="Подлежит уничтожению" checked={isDestroyable} onChange={(event) => setIsDestroyable(event.target.checked)} size="m" />
          )}
        </Modal.Content>
        <Modal.Actions className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary" disabled={!isValid} isLoading={isSubmitting}>{isEdit ? 'Сохранить' : 'Добавить'}</Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
