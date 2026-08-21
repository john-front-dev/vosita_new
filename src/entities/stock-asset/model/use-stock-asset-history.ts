import { useGetQuery } from '@shared/api';

import { stockAssetEndpoints } from '../api/stock-asset-api';
import type { StockAssetHistoryResponse } from './types';

export const useStockAssetHistory = (id?: string, enabled = true) => {
  const query = useGetQuery<StockAssetHistoryResponse>({
    queryKey: ['stock-asset-history', id],
    url: stockAssetEndpoints.history(id ?? ''),
    options: { enabled: enabled && Boolean(id) },
  });

  return {
    ...query,
    history:
      query.data?.payload?.historyList ??
      query.data?.payload?.payload ??
      query.data?.historyList ??
      [],
  };
};
