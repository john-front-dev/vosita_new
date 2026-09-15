import { snackbar } from 'alif-ui';

import { applicationEndpoints } from '@entities/application';
import { useMutationQuery } from '@shared/api';

import { invalidateApplicationDetailsQueries } from './application-details-cache';

type UseApplicationDetailsActionsParams = {
  onDeleted: () => void;
  onReceiptUploaded: () => void;
};

export const useApplicationDetailsActions = ({
  onDeleted,
  onReceiptUploaded,
}: UseApplicationDetailsActionsParams) => {
  const { isPending: isDeletingDirectly, mutate: deleteSubrequests } = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: '',
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Объекты удалены', type: 'success' });
        onDeleted();
        invalidateApplicationDetailsQueries();
      },
    },
  });

  const { isPending: isRemoving, mutate: removeSubrequests } = useMutationQuery<
    ApiResponse<unknown>,
    { params: { action_type: string; object_id: string } }
  >({
    method: 'post',
    url: applicationEndpoints.action,
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Объекты удалены', type: 'success' });
        onDeleted();
        invalidateApplicationDetailsQueries();
      },
    },
  });

  const { isPending: isUploadingReceipt, mutate: uploadReceipt } = useMutationQuery<
    ApiResponse<unknown>,
    { body: FormData; url: string }
  >({
    method: 'post',
    url: '',
    config: { headers: { 'Content-Type': 'multipart/form-data' } },
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Чек добавлен', type: 'success' });
        onReceiptUploaded();
        invalidateApplicationDetailsQueries();
      },
    },
  });

  return {
    deleteSubrequests: (ids: string) =>
      deleteSubrequests({ url: applicationEndpoints.deleteSubrequests(ids) }),
    isDeleting: isDeletingDirectly || isRemoving,
    isUploadingReceipt,
    removeSubrequests: (ids: string) =>
      removeSubrequests({ params: { action_type: 'remove', object_id: ids } }),
    refresh: invalidateApplicationDetailsQueries,
    uploadReceipt: (ids: string, file: File) => {
      const formData = new FormData();

      formData.append('file', file);
      uploadReceipt({
        body: formData,
        url: applicationEndpoints.uploadReceipt(ids),
      });
    },
  };
};
