import { snackbar } from 'alif-ui';

import { employeeEndpoints } from '@entities/employee';
import { useMutationQuery } from '@shared/api';

type CreateEmployeeBody = { email: string; name: string; organization: 'ALIF' };

export const useCreateEmployee = (onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<
    ApiResponse<unknown>,
    { body: CreateEmployeeBody }
  >({
    method: 'post',
    url: employeeEndpoints.create,
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Сотрудник добавлен', type: 'success' });
        onSuccess();
      },
      onError: () => snackbar.show({ title: 'Не удалось добавить сотрудника', type: 'error' }),
    },
  });

  return {
    create: (name: string, email: string) =>
      mutate({ body: { email, name, organization: 'ALIF' } }),
    isCreating: isPending,
  };
};

export const useRefreshEmployees = (onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<ApiResponse<unknown>>({
    method: 'post',
    url: employeeEndpoints.refresh,
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Список сотрудников обновлён', type: 'success' });
        onSuccess();
      },
      onError: () => snackbar.show({ title: 'Не удалось обновить список', type: 'error' }),
    },
  });

  return { isRefreshing: isPending, refresh: () => mutate({}) };
};
