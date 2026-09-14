import { useState } from 'react';
import { Button, Loader, Modal, Select, snackbar, Typography } from 'alif-ui';

import { httpClient, useGetQuery } from '@shared/api';
import { normalizeSelectValue } from '@shared/lib';
import { DetailsRow } from '@shared/ui';

import { categoriesEndpoints } from '../api/categories-api';
import type { TmzCategoryDetails } from '../model/types';
import { useTmzCategoryOptions } from '../model/use-tmz-category-options';

type Props = { categoryId: number | null; canManage: boolean; onClose: () => void; onSuccess: () => void };

export const TmzCategoryDetailsModal = ({ categoryId, canManage, onClose, onSuccess }: Props) => {
  const details = useGetQuery<ApiResponse<TmzCategoryDetails[]>>({
    queryKey: ['tmz-category-details', categoryId],
    url: categoriesEndpoints.tmzDetails(categoryId ?? 0),
    options: { enabled: categoryId !== null },
  });
  const options = useTmzCategoryOptions(categoryId !== null && canManage);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [storageId, setStorageId] = useState('');
  const [expenseTypeId, setExpenseTypeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const save = async (item: TmzCategoryDetails) => {
    setIsSubmitting(true);
    try {
      await httpClient.put(categoriesEndpoints.updateTmz, [{
        accountant_number: item.accountant_number,
        expense_type_id: expenseTypeId || item.expense_type_id,
        id: item.id,
        name: item.name,
        storage_id: Number(storageId || item.storage_id),
      }]);
      snackbar.show({ title: 'Тип расхода обновлён', type: 'success' });
      setEditingId(null);
      details.refetch();
      onSuccess();
    } catch {
      snackbar.show({ title: 'Не удалось обновить тип расхода', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal className="w-180" isOpen={categoryId !== null} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Категория ТМЗ" />
      <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        {details.isLoading && <div className="flex justify-center py-6"><Loader /></div>}
        {!details.isLoading && !details.data?.payload.length && <Typography category="body" proportions="s">Нет данных</Typography>}
        {details.data?.payload.map((item) => (
          <div key={item.id} className="rounded-xl border border-(--color-border-default) p-4">
            <DetailsRow label="Тип расхода" value={item.name} />
            <DetailsRow label="Локация" value={item.branch_name} />
            <DetailsRow label="Склад" value={item.storage_name} />
            <DetailsRow label="Счёт" value={item.accountant_number} />
            {editingId === item.id ? (
              <div className="mt-4 flex flex-col gap-3">
                <Select label="Тип расхода" value={expenseTypeId || item.expense_type_id} options={options.expenseTypes.map((option) => ({ label: option.expenseType, value: option.id }))} onChange={(value) => setExpenseTypeId(normalizeSelectValue(value))} fullWidth />
                <Select label="Склад" value={storageId || String(item.storage_id)} options={options.storages.map((option) => ({ label: option.name, value: String(option.id) }))} onChange={(value) => setStorageId(normalizeSelectValue(value))} fullWidth />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline-neutral" onClick={() => setEditingId(null)}>Отмена</Button>
                  <Button type="button" variant="primary" isLoading={isSubmitting} onClick={() => save(item)}>Сохранить</Button>
                </div>
              </div>
            ) : canManage ? (
              <div className="mt-3 flex justify-end"><Button type="button" variant="outline-neutral" onClick={() => { setEditingId(item.id); setStorageId(String(item.storage_id)); setExpenseTypeId(item.expense_type_id); }}>Изменить</Button></div>
            ) : null}
          </div>
        ))}
      </Modal.Content>
    </Modal>
  );
};
