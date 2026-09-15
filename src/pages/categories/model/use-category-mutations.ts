import { useState } from 'react';
import { snackbar } from 'alif-ui';

import { httpClient, queryClient, useMutationQuery } from '@shared/api';

import { categoriesEndpoints } from '../api/categories-api';
import type { CategoryType, MbpCategory, TmzCategoryDetails } from './types';

type CategoryFormValues = {
  depreciationRate: number;
  isDestroyable: boolean;
  name: string;
  taxGroupId: number;
};

type TmzCategoryBinding = {
  accountant_number: string;
  branchName: string;
  category_id: number;
  expense_type_id: string;
  id: number;
  name: string;
  storage_id: number;
};

export const useRemoveCategory = (
  type: Exclude<CategoryType, 'tmz'>,
  onSuccess: () => void,
) => {
  const { isPending, mutate } = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: '',
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['categories-page-list', type] });
        snackbar.show({ title: 'Категория удалена', type: 'success' });
        onSuccess();
      },
    },
  });

  return {
    isRemoving: isPending,
    remove: (id: number) =>
      mutate({
        url: type === 'os' ? categoriesEndpoints.removeOs(id) : categoriesEndpoints.removeMbp(id),
      }),
  };
};

export const useSaveCategory = (onSuccess: () => void) => {
  const [isSaving, setIsSaving] = useState(false);

  const save = async (
    type: Exclude<CategoryType, 'tmz'>,
    record: MbpCategory | null,
    values: CategoryFormValues,
    recordId?: number,
  ) => {
    setIsSaving(true);
    try {
      if (type === 'os') {
        const body = {
          depreciation_rate: values.depreciationRate,
          name: values.name,
          parent_id: values.taxGroupId,
        };
        await httpClient.post(
          recordId ? categoriesEndpoints.editOs(recordId) : categoriesEndpoints.createOs,
          body,
        );
      } else if (!recordId) {
        await httpClient.post(categoriesEndpoints.createMbp, {
          is_destroyable: values.isDestroyable,
          name: values.name,
        });
      } else {
        if (values.name !== record?.name) {
          await httpClient.put(categoriesEndpoints.updateMbp(recordId), {
            id: recordId,
            name: values.name,
          });
        }
        if (values.isDestroyable !== record?.is_destroyable) {
          await httpClient.put(categoriesEndpoints.updateMbpStatus(recordId), {
            id: recordId,
            is_destroyable: values.isDestroyable,
          });
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['categories-page-list', type] });
      snackbar.show({ title: recordId ? 'Категория обновлена' : 'Категория добавлена', type: 'success' });
      onSuccess();
    } catch {
      snackbar.show({ title: 'Не удалось сохранить категорию', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, save };
};

export const useCreateTmzCategoryBindings = (onSuccess: () => void) => {
  const [isCreating, setIsCreating] = useState(false);
  const create = async (body: TmzCategoryBinding[]) => {
    setIsCreating(true);
    try {
      await httpClient.post(categoriesEndpoints.createTmz, body);
      await queryClient.invalidateQueries({ queryKey: ['categories-page-list', 'tmz'] });
      snackbar.show({ title: 'Типы расходов добавлены', type: 'success' });
      onSuccess();
    } catch {
      snackbar.show({ title: 'Не удалось добавить типы расходов', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };
  return { create, isCreating };
};

export const useUpdateTmzCategoryBinding = (onSuccess: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const update = async (
    item: TmzCategoryDetails,
    expenseTypeId: string,
    storageId: string,
  ) => {
    setIsUpdating(true);
    try {
      await httpClient.put(categoriesEndpoints.updateTmz, [{
        accountant_number: item.accountant_number,
        expense_type_id: expenseTypeId,
        id: item.id,
        name: item.name,
        storage_id: Number(storageId),
      }]);
      await queryClient.invalidateQueries({ queryKey: ['categories-page-list', 'tmz'] });
      snackbar.show({ title: 'Тип расхода обновлён', type: 'success' });
      onSuccess();
    } catch {
      snackbar.show({ title: 'Не удалось обновить тип расхода', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };
  return { isUpdating, update };
};
