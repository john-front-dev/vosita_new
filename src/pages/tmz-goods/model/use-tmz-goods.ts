import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { getTmzGoodsEndpoint } from '../api/tmz-goods-api';
import type { TmzGoodsResponse } from './types';

type UseTmzGoodsParams = {
  categoryId: number;
  limit: number;
  page: number;
  searchText: string;
  storageId: number;
};

export const useTmzGoods = ({
  categoryId,
  limit,
  page,
  searchText,
  storageId,
}: UseTmzGoodsParams) => {
  const params = useMemo(
    () => ({
      limit,
      name: searchText.trim(),
      page,
      storage_id: storageId,
      with_zero_count: false,
    }),
    [limit, page, searchText, storageId],
  );
  const query = useGetQuery<TmzGoodsResponse>({
    queryKey: ['tmz-goods', categoryId],
    url: getTmzGoodsEndpoint(categoryId),
    params,
    options: { enabled: Boolean(categoryId && storageId) },
  });
  const payload = query.data?.payload;
  const goods = payload?.data ?? [];

  return {
    ...query,
    goods,
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
    totalQuantity: goods.reduce((sum, good) => sum + (Number(good.total_qty) || 0), 0),
  };
};
