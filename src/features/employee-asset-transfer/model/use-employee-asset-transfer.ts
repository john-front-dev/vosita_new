import { employeeEndpoints } from '@entities/employee';
import { queryClient, useMutationQuery } from '@shared/api';
import { notify, notifyError } from '@shared/lib';

export type EmployeeAssetTransferPayload = {
  department_id: number;
  inventory_number: string[];
  responsible_id: string;
  room_id: number;
  subdivision_id: number;
};

export const useEmployeeAssetTransfer = (employeeId: number | string, onSuccess: () => void) => {
  const mutation = useMutationQuery<
    ApiResponse<unknown>,
    { body: EmployeeAssetTransferPayload }
  >({
    method: 'post',
    url: employeeEndpoints.delegateAssets,
    options: {
      onError: () => notifyError('Не удалось передать ОС'),
      onSuccess: (response) => {
        if (response.code !== 200) {
          notifyError('Не удалось передать ОС', response.message);
          return;
        }

        notify({ title: response.message || 'ОС успешно переданы', type: 'success' });
        void queryClient.invalidateQueries({
          queryKey: ['employee-details', String(employeeId)],
        });
        onSuccess();
      },
    },
  });

  return {
    isTransferring: mutation.isPending,
    transfer: (body: EmployeeAssetTransferPayload) => mutation.mutate({ body }),
  };
};
