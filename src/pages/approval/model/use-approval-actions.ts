import { queryClient, useMutationQuery } from '@shared/api';

import { approvalEndpoints } from '../api/approval-api';

export const useApprovalActions = () => {
  const approve = useMutationQuery<ApiResponse>({
    method: 'post',
    mutationKey: ['approval', 'approve'],
    url: approvalEndpoints.approve,
    options: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval'] }),
    },
  });
  const reject = useMutationQuery<ApiResponse>({
    method: 'post',
    mutationKey: ['approval', 'reject'],
    url: approvalEndpoints.reject,
    options: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval'] }),
    },
  });

  return {
    approve: (ids: number[]) => approve.mutateAsync({ params: { operation_ids: ids.join(',') } }),
    reject: (ids: number[]) => reject.mutateAsync({ params: { operation_ids: ids.join(',') } }),
    isPending: approve.isPending || reject.isPending,
  };
};
