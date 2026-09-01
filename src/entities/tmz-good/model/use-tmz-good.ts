import { useGetQuery } from '@shared/api';

import { tmzGoodEndpoints } from '../api/tmz-good-api';
import type {
  TmzCartResponse,
  TmzGoodHistoryResponse,
  TmzGoodRemainsResponse,
} from './types';

export const useTmzGood = (goodsId?: string, storageId?: string) => {
  const query = useGetQuery<TmzGoodRemainsResponse>({
    queryKey: ['tmz-good', goodsId, storageId],
    url: tmzGoodEndpoints.details(goodsId ?? ''),
    params: { storage_id: storageId },
    options: { enabled: Boolean(goodsId && storageId) },
  });

  return { ...query, remains: query.data?.payload ?? [] };
};

export const useTmzGoodHistory = (goodsId?: string, storageId?: string, enabled = true) => {
  const query = useGetQuery<TmzGoodHistoryResponse>({
    queryKey: ['tmz-good-history', goodsId, storageId],
    url: tmzGoodEndpoints.history(goodsId ?? '', storageId ?? ''),
    options: { enabled: enabled && Boolean(goodsId && storageId) },
  });

  return { ...query, history: query.data?.payload ?? [] };
};

export const useTmzCart = (enabled = true) => {
  const query = useGetQuery<TmzCartResponse>({
    queryKey: ['tmz-cart'],
    url: tmzGoodEndpoints.cart,
    options: { enabled },
  });

  return { ...query, items: query.data?.payload ?? [] };
};
