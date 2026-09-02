import { useGetQuery } from '@shared/api';

import { stockAssetEndpoints } from '../api/stock-asset-api';
import type { AssetResource, StockAssetComment, StockAssetCommentsResponse } from './types';

const normalizeComment = (comment: StockAssetComment): StockAssetComment => ({
  ...comment,
  date: comment.date ?? comment.created_at,
  full_name: comment.full_name ?? comment.employee_name,
  is_edit: comment.is_edit ?? comment.is_edited,
  replies: comment.replies?.map(normalizeComment),
});

export const useStockAssetComments = (
  id?: string,
  enabled = true,
  resource: AssetResource = 'stock-asset',
) => {
  const query = useGetQuery<StockAssetCommentsResponse>({
    queryKey: ['asset-comments', resource, id],
    url: stockAssetEndpoints.comments(id ?? '', resource),
    options: { enabled: enabled && Boolean(id) },
  });

  return {
    ...query,
    comments: (query.data?.payload ?? []).map(normalizeComment),
  };
};
