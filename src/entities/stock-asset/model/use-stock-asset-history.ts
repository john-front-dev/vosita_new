import { useGetQuery } from '@shared/api';

import { stockAssetEndpoints } from '../api/stock-asset-api';
import type { StockAssetHistoryResponse } from './types';
import type { AssetResource } from './types';

export const useStockAssetHistory = (
  id?: string,
  enabled = true,
  resource: AssetResource = 'stock-asset',
  page = 1,
) => {
  const params = resource === 'mbp' ? { limit: 10, page } : undefined;
  const query = useGetQuery<StockAssetHistoryResponse>({
    queryKey: ['asset-history', resource, id],
    url: stockAssetEndpoints.history(id ?? '', resource),
    params,
    options: { enabled: enabled && Boolean(id) },
  });
  const history =
    query.data?.payload?.historyList ??
    query.data?.payload?.payload ??
    query.data?.historyList ??
    [];

  return {
    ...query,
    history,
    currentPage: query.data?.payload?.page ?? page,
    totalCount: query.data?.payload?.totalItems ?? history.length,
    totalPages: query.data?.payload?.totalPages ?? 1,
  };
};
