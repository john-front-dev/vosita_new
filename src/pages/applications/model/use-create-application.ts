import { snackbar } from 'alif-ui';

import { applicationEndpoints } from '@entities/application';
import { queryClient, useMutationQuery } from '@shared/api';

import type { CreateApplicationRequest } from './types';

export const useCreateApplication = (onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<
    ApiResponse<unknown>,
    { body: CreateApplicationRequest }
  >({
    method: 'post',
    url: applicationEndpoints.create,
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['applications'] });
        snackbar.show({ title: 'Запрос создан', type: 'success' });
        onSuccess();
      },
    },
  });

  return { create: (body: CreateApplicationRequest) => mutate({ body }), isCreating: isPending };
};
