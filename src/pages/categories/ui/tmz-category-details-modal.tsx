import { useState } from 'react';
import { Button, Loader, Modal, Select, Typography } from 'alif-ui';

import { useGetQuery } from '@shared/api';
import { normalizeSelectValue } from '@shared/lib';
import { DetailsRow } from '@shared/ui';

import { categoriesEndpoints } from '../api/categories-api';
import type { TmzCategoryDetails } from '../model/types';
import { useUpdateTmzCategoryBinding } from '../model/use-category-mutations';
import { useTmzCategoryOptions } from '../model/use-tmz-category-options';

type Props = { categoryId: number | null; canManage: boolean; onClose: () => void };

export const TmzCategoryDetailsModal = ({ categoryId, canManage, onClose }: Props) => {
  const {
    data,
    isLoading,
    refetch,
  } = useGetQuery<ApiResponse<TmzCategoryDetails[]>>({
    queryKey: ['tmz-category-details', categoryId],
    url: categoriesEndpoints.tmzDetails(categoryId ?? 0),
    options: { enabled: categoryId !== null },
  });
  const { expenseTypes, storages } = useTmzCategoryOptions(categoryId !== null && canManage);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [storageId, setStorageId] = useState('');
  const [expenseTypeId, setExpenseTypeId] = useState('');
  const { isUpdating, update } = useUpdateTmzCategoryBinding(() => {
    setEditingId(null);
    void refetch();
  });

  const save = async (item: TmzCategoryDetails) => {
    await update(item, expenseTypeId, storageId);
  };

  return (
    <Modal
      className="w-180"
      isOpen={categoryId !== null}
      onClose={onClose}
      isCentered
      withCloseButton
    >
      <Modal.Header title="Категория ТМЗ" />
      <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        )}
        {!isLoading && !data?.payload.length && (
          <Typography category="body" proportions="s">
            Нет данных
          </Typography>
        )}
        {data?.payload.map((item) => (
          <div key={item.id} className="rounded-xl border border-(--color-border-default) p-4">
            <DetailsRow label="Тип расхода" value={item.name} />
            <DetailsRow label="Локация" value={item.branch_name} />
            <DetailsRow label="Склад" value={item.storage_name} />
            <DetailsRow label="Счёт" value={item.accountant_number} />
            {editingId === item.id ? (
              <div className="mt-4 flex flex-col gap-3">
                <Select
                  label="Тип расхода"
                  value={expenseTypeId || item.expense_type_id}
                    options={expenseTypes.map((option) => ({
                    label: option.expenseType,
                    value: option.id,
                  }))}
                  onChange={(value) => setExpenseTypeId(normalizeSelectValue(value))}
                  fullWidth
                />
                <Select
                  label="Склад"
                  value={storageId || String(item.storage_id)}
                    options={storages.map((option) => ({
                    label: option.name,
                    value: String(option.id),
                  }))}
                  onChange={(value) => setStorageId(normalizeSelectValue(value))}
                  fullWidth
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline-neutral"
                    onClick={() => setEditingId(null)}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    isLoading={isUpdating}
                    onClick={() => save(item)}
                  >
                    Сохранить
                  </Button>
                </div>
              </div>
            ) : canManage ? (
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="outline-neutral"
                  onClick={() => {
                    setEditingId(item.id);
                    setStorageId(String(item.storage_id));
                    setExpenseTypeId(item.expense_type_id);
                  }}
                >
                  Изменить
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </Modal.Content>
    </Modal>
  );
};
