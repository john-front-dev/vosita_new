import { useState } from 'react';
import { snackbar } from 'alif-ui';

import { httpClient } from '@shared/api';
import { downloadBlob } from '@shared/lib';

import { fixedAssetsEndpoints } from '../api/fixed-assets-api';
import { buildFixedAssetsListParams } from './build-fixed-assets-list-params';
import type { FixedAssetsFilters } from './fixed-assets-filters';

export const useDownloadFixedAssets = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const download = async (
    filters: FixedAssetsFilters,
    page: number,
    limit: number,
    searchText?: string,
  ) => {
    setIsDownloading(true);
    try {
      const { data } = await httpClient.get<Blob>(fixedAssetsEndpoints.download, {
        params: buildFixedAssetsListParams(filters, page, limit, searchText),
        responseType: 'blob',
      });
      downloadBlob(data, 'fixed-assets.xlsx');
    } catch {
      snackbar.show({ title: 'Не удалось скачать файл', type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };
  return { download, isDownloading };
};
