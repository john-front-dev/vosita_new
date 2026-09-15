import { snackbar } from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';

import { trashEndpoints } from '../api/trash-api';
import type { TrashType } from './types';

export const useRestoreTrashRecord = (type: TrashType, onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'post',
    url: '',
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['trash-list', type] });
        snackbar.show({ title: 'Объект восстановлен', type: 'success' });
        onSuccess();
      },
    },
  });

  return {
    isRestoring: isPending,
    restore: (id: number) => mutate({ url: trashEndpoints.restore(id) }),
  };
};
