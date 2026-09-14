import { queryClient, useMutationQuery } from '@shared/api';
import { notify } from '@shared/lib';

import { mbpActionEndpoints } from '../api/mbp-actions-api';

type ActionParams = {
  id: number | string;
  onSuccess?: () => void;
};

const invalidateMbp = (id: number | string) => {
  queryClient.invalidateQueries({ queryKey: ['mbp-details', String(id)] });
  queryClient.invalidateQueries({ queryKey: ['mbp'] });
  queryClient.invalidateQueries({ queryKey: ['asset-history', 'mbp', String(id)] });
};

const useMbpMutation = ({
  id,
  method,
  onSuccess,
  successMessage,
  url,
}: ActionParams & {
  method: 'patch' | 'post' | 'put';
  successMessage: string;
  url: string;
}) =>
  useMutationQuery<ApiResponse<unknown>, { body?: Record<string, unknown> }>({
    method,
    url,
    options: {
      onSuccess: () => {
        notify({ title: successMessage, type: 'success' });
        invalidateMbp(id);
        onSuccess?.();
      },
    },
  });

export const useMbpEdit = ({ id, onSuccess }: ActionParams) => {
  const mutation = useMbpMutation({
    id,
    method: 'patch',
    onSuccess,
    successMessage: 'МБП обновлён',
    url: mbpActionEndpoints.edit(id),
  });

  return {
    edit: (body: Record<string, unknown>) => mutation.mutate({ body }),
    isEditing: mutation.isPending,
  };
};

export const useMbpIssueToEmployee = ({ id, onSuccess }: ActionParams) => {
  const mutation = useMbpMutation({
    id,
    method: 'post',
    onSuccess,
    successMessage: 'МБП успешно выдан сотруднику',
    url: mbpActionEndpoints.issueToEmployee,
  });

  return {
    isIssuing: mutation.isPending,
    issue: (body: Record<string, unknown>) => mutation.mutate({ body }),
  };
};

export const useMbpIssueToWarehouse = ({ id, onSuccess }: ActionParams) => {
  const mutation = useMbpMutation({
    id,
    method: 'post',
    onSuccess,
    successMessage: 'МБП успешно отправлен на склад',
    url: mbpActionEndpoints.issueToWarehouse(id),
  });

  return {
    isPending: mutation.isPending,
    run: (afterSuccess?: () => void) =>
      mutation.mutate({}, { onSuccess: () => afterSuccess?.() }),
  };
};

export const useMbpWriteOff = ({ id, onSuccess }: ActionParams) => {
  const mutation = useMbpMutation({
    id,
    method: 'put',
    onSuccess,
    successMessage: 'МБП успешно списан',
    url: mbpActionEndpoints.writeOff(id),
  });

  return {
    isPending: mutation.isPending,
    run: (afterSuccess?: () => void) =>
      mutation.mutate({}, { onSuccess: () => afterSuccess?.() }),
  };
};

export const useMbpDestroy = ({ id, onSuccess }: ActionParams) => {
  const mutation = useMbpMutation({
    id,
    method: 'put',
    onSuccess,
    successMessage: 'МБП отмечен как уничтоженный',
    url: mbpActionEndpoints.destroy(id),
  });

  return {
    isPending: mutation.isPending,
    run: (afterSuccess?: () => void) =>
      mutation.mutate({}, { onSuccess: () => afterSuccess?.() }),
  };
};
