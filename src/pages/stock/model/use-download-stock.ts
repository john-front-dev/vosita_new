import { useState } from 'react';
import { snackbar } from 'alif-ui';

import { httpClient } from '@shared/api';
import { downloadBlob } from '@shared/lib';

import { getStockRequestConfig, stockDownloadEndpoint } from '../api/stock-api';
import { buildStockListParams } from '../lib/build-stock-list-params';
import type { StockFilters, StockListType } from './types';

type DownloadStockParams = {
  filters: StockFilters;
  limit: number;
  page: number;
  searchText?: string;
  type: StockListType;
};

export const useDownloadStock = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const download = async (parameters: DownloadStockParams) => {
    setIsDownloading(true);
    try {
      const params = buildStockListParams(parameters);
      const { data } = await httpClient.get<Blob>(stockDownloadEndpoint, {
        ...getStockRequestConfig(params),
        responseType: 'blob',
      });
      downloadBlob(data, `stock-${parameters.type}.xlsx`);
    } catch {
      snackbar.show({ title: 'Не удалось скачать файл', type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };
  return { download, isDownloading };
};
