import { useState } from 'react';
import { snackbar } from 'alif-ui';

import { applicationEndpoints } from '@entities/application';
import { httpClient } from '@shared/api';
import { downloadBlob } from '@shared/lib';

export const useDownloadApplicationInvoice = () => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const download = async (id: number, invoiceNumber: string) => {
    setDownloadingId(id);
    try {
      const { data } = await httpClient.get<Blob>(applicationEndpoints.downloadInvoice(id), {
        responseType: 'blob',
      });
      downloadBlob(data, `invoice-${invoiceNumber}.pdf`);
    } catch {
      snackbar.show({ title: 'Не удалось скачать накладную', type: 'error' });
    } finally {
      setDownloadingId(null);
    }
  };
  return { download, downloadingId };
};
