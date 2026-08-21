import { useState } from 'react';
import { Button, OutlineSystemDownload, snackbar } from 'alif-ui';

import { httpClient } from '@shared/api';

import { fixedAssetsEndpoints } from '../api/fixed-assets-api';
import { buildFixedAssetsListParams } from '../model/build-fixed-assets-list-params';
import type { FixedAssetsFilters } from '../model/fixed-assets-filters';

type FixedAssetsDownloadButtonProps = {
  filters: FixedAssetsFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const FixedAssetsDownloadButton = ({
  filters,
  limit,
  page,
  searchText,
}: FixedAssetsDownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const response = await httpClient.get<Blob>(fixedAssetsEndpoints.download, {
        params: buildFixedAssetsListParams(filters, page, limit, searchText),
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      link.href = url;
      link.download = 'fixed-assets.xlsx';
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      snackbar.show({ title: 'Не удалось скачать файл', type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline-neutral"
      size="m"
      leftSection={<OutlineSystemDownload />}
      onClick={handleDownload}
      isLoading={isDownloading}
    >
      Скачать
    </Button>
  );
};
