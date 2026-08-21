import { snackbar } from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';

import { applicationEndpoints } from '../api/applications-api';

const invalidateApplicationQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['application-details'] });
  queryClient.invalidateQueries({ queryKey: ['application-invoices'] });
  queryClient.invalidateQueries({ queryKey: ['applications'] });
};

type UseApplicationDetailsActionsParams = {
  onDeleted: () => void;
  onReceiptUploaded: () => void;
};

export const useApplicationDetailsActions = ({
  onDeleted,
  onReceiptUploaded,
}: UseApplicationDetailsActionsParams) => {
  const deleteMutation = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: '',
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Объекты удалены', type: 'success' });
        onDeleted();
        invalidateApplicationQueries();
      },
    },
  });

  const removeMutation = useMutationQuery<
    ApiResponse<unknown>,
    { params: { action_type: string; object_id: string } }
  >({
    method: 'post',
    url: applicationEndpoints.action,
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Объекты удалены', type: 'success' });
        onDeleted();
        invalidateApplicationQueries();
      },
    },
  });

  const uploadReceiptMutation = useMutationQuery<
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
        invalidateApplicationQueries();
      },
    },
  });

  return {
    deleteSubrequests: (ids: string) =>
      deleteMutation.mutate({ url: applicationEndpoints.deleteSubrequests(ids) }),
    isDeleting: deleteMutation.isPending || removeMutation.isPending,
    isUploadingReceipt: uploadReceiptMutation.isPending,
    removeSubrequests: (ids: string) =>
      removeMutation.mutate({ params: { action_type: 'remove', object_id: ids } }),
    refresh: invalidateApplicationQueries,
    uploadReceipt: (ids: string, file: File) => {
      const formData = new FormData();

      formData.append('file', file);
      uploadReceiptMutation.mutate({
        body: formData,
        url: applicationEndpoints.uploadReceipt(ids),
      });
    },
  };
};
