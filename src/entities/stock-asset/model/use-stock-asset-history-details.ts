import { useGetQuery } from '@shared/api';

import { stockAssetEndpoints } from '../api/stock-asset-api';
import type { StockAssetHistoryDetails, StockAssetHistoryDetailsResponse } from './types';

export const useStockAssetHistoryDetails = (historyId?: number | string) => {
  const query = useGetQuery<StockAssetHistoryDetailsResponse>({
    queryKey: ['stock-asset-history-details', historyId],
    url: stockAssetEndpoints.historyDetails(historyId ?? ''),
    options: { enabled: Boolean(historyId) },
  });

  const payload = query.data?.payload;
  const history = Array.isArray(payload?.payload) ? payload.payload[0] : undefined;

  return { ...query, history: history as StockAssetHistoryDetails | undefined };
};
