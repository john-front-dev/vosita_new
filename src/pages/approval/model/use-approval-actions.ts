import { useState } from 'react';
import { snackbar } from 'alif-ui';

import { httpClient, queryClient, useMutationQuery } from '@shared/api';
import { downloadBlob } from '@shared/lib';

import { approvalEndpoints } from '../api/approval-api';

export const useApprovalActions = () => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
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

  const downloadInvoice = async (id: number, invoiceNumber: string | number) => {
    setDownloadingId(id);
    try {
      const { data } = await httpClient.get<Blob>(approvalEndpoints.invoice(id), {
        responseType: 'blob',
      });
      downloadBlob(data, `invoice-${invoiceNumber}.pdf`);
      snackbar.show({ title: 'Накладная скачана', type: 'success' });
    } catch {
      snackbar.show({ title: 'Не удалось скачать накладную', type: 'error' });
    } finally {
      setDownloadingId(null);
    }
  };

  return {
    approve: (ids: number[]) => approve.mutateAsync({ params: { operation_ids: ids.join(',') } }),
    downloadInvoice,
    downloadingId,
    reject: (ids: number[]) => reject.mutateAsync({ params: { operation_ids: ids.join(',') } }),
    isPending: approve.isPending || reject.isPending,
  };
};
