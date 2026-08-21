import { useGetQuery } from '@shared/api';

import { stockAssetEndpoints } from '../api/stock-asset-api';
import type { StockAssetResponse } from './types';

export const useStockAsset = (id?: string) => {
  const query = useGetQuery<StockAssetResponse>({
    queryKey: ['stock-asset', id],
    url: stockAssetEndpoints.details(id ?? ''),
    options: { enabled: Boolean(id) },
  });

  return {
    ...query,
    asset: query.data?.payload,
  };
};
