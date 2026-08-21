import { useGetQuery } from '@shared/api';

import { stockAssetEndpoints } from '../api/stock-asset-api';
import type { StockAssetCommentsResponse } from './types';

export const useStockAssetComments = (id?: string, enabled = true) => {
  const query = useGetQuery<StockAssetCommentsResponse>({
    queryKey: ['stock-asset-comments', id],
    url: stockAssetEndpoints.comments(id ?? ''),
    options: { enabled: enabled && Boolean(id) },
  });

  return {
    ...query,
    comments: query.data?.payload ?? [],
  };
};
