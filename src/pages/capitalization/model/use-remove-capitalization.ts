import { snackbar } from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';

import { capitalizationEndpoints } from '../api/capitalization-api';

export const useRemoveCapitalization = (onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: capitalizationEndpoints.list,
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['capitalization-list'] });
        snackbar.show({ title: 'Запись капитализации удалена', type: 'success' });
        onSuccess();
      },
      onError: () =>
        snackbar.show({ title: 'Не удалось удалить запись капитализации', type: 'error' }),
    },
  });

  return {
    isRemoving: isPending,
    remove: (id: number) => mutate({ url: capitalizationEndpoints.remove(id) }),
  };
};
