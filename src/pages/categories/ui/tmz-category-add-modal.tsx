import { useState } from 'react';
import { Button, Modal, Select, snackbar } from 'alif-ui';

import { httpClient } from '@shared/api';
import { normalizeSelectValue } from '@shared/lib';

import { categoriesEndpoints } from '../api/categories-api';
import { useTmzCategoryOptions } from '../model/use-tmz-category-options';

type Props = { isOpen: boolean; onClose: () => void; onSuccess: () => void };

type FormRow = {
  categoryId: string;
  expenseTypeId: string;
  key: number;
  storageId: string;
};

const createRow = (key: number): FormRow => ({
  categoryId: '',
  expenseTypeId: '',
  key,
  storageId: '',
});

export const TmzCategoryAddModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const options = useTmzCategoryOptions(isOpen);
  const [rows, setRows] = useState<FormRow[]>([createRow(1)]);
  const [nextKey, setNextKey] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = rows.every((row) => {
    const expenseType = options.expenseTypes.find((item) => item.id === row.expenseTypeId);
    return Boolean(row.storageId && row.expenseTypeId && row.categoryId && expenseType?.branchName);
  });

  const updateRow = (key: number, patch: Partial<FormRow>) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    if (rows.length >= 5) return;
    setRows((current) => [...current, createRow(nextKey)]);
    setNextKey((current) => current + 1);
  };

  const removeRow = (key: number) => {
    if (rows.length === 1) return;
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const submit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      const body = rows.map((row, index) => {
        const expenseType = options.expenseTypes.find((item) => item.id === row.expenseTypeId)!;
        return {
          accountant_number: expenseType.accountNumber ?? '',
          branchName: expenseType.branchName ?? '',
          category_id: Number(row.categoryId),
          expense_type_id: expenseType.id,
          id: index === 0 ? 1 : 0,
          name: expenseType.expenseType,
          storage_id: Number(row.storageId),
        };
      });
      await httpClient.post<ApiResponse<unknown>>(categoriesEndpoints.createTmz, body);
      snackbar.show({ title: 'Типы расходов добавлены', type: 'success' });
      onSuccess();
      onClose();
    } catch {
      snackbar.show({ title: 'Не удалось добавить типы расходов', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal className="w-160" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Добавить тип расхода" />
      <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          {rows.map((row, index) => (
            <div className="flex flex-col gap-3 rounded-lg border border-solid border-neutral-200 p-4" key={row.key}>
              <div className="flex items-center justify-between gap-3">
                <span>Привязка {index + 1}</span>
                {rows.length > 1 && (
                  <Button type="button" variant="risk" size="s" onClick={() => removeRow(row.key)}>
                    Удалить
                  </Button>
                )}
              </div>
              <Select
                label="Склад"
                value={row.storageId || null}
                options={options.storages.map((item) => ({ label: item.name, value: String(item.id) }))}
                onChange={(value) => updateRow(row.key, { storageId: normalizeSelectValue(value) })}
                isLoading={options.isLoading}
                fullWidth
              />
              <Select
                label="Тип расхода"
                value={row.expenseTypeId || null}
                options={options.expenseTypes.map((item) => ({ label: item.expenseType, value: item.id }))}
                onChange={(value) => updateRow(row.key, { expenseTypeId: normalizeSelectValue(value) })}
                isLoading={options.isLoading}
                fullWidth
              />
              <Select
                label="Категория"
                value={row.categoryId || null}
                options={options.categories.map((item) => ({ label: item.name, value: String(item.id) }))}
                onChange={(value) => updateRow(row.key, { categoryId: normalizeSelectValue(value) })}
                isLoading={options.isLoading}
                fullWidth
              />
            </div>
          ))}
          {rows.length < 5 && (
            <Button type="button" variant="outline-neutral" onClick={addRow}>
              Добавить ещё привязку
            </Button>
          )}
        </Modal.Content>
        <Modal.Actions className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary" disabled={!isValid} isLoading={isSubmitting}>Сохранить</Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
