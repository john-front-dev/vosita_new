import { snackbar } from 'alif-ui';

import { tmzGoodEndpoints, type TmzGoodOperationPayload } from '@entities/tmz-good';
import { queryClient, useMutationQuery } from '@shared/api';
import { downloadBlob } from '@shared/lib';

const invalidate = (goodsId?: number | string) => {
  void queryClient.invalidateQueries({ queryKey: ['tmz-cart'] });
  if (goodsId !== undefined) {
    void queryClient.invalidateQueries({ queryKey: ['tmz-good', String(goodsId)] });
    void queryClient.invalidateQueries({ queryKey: ['tmz-good-history', String(goodsId)] });
  }
};

export const useAddTmzGoodToCart = (goodsId: number | string, onSuccess?: () => void) => {
  const mutation = useMutationQuery<
    ApiResponse<unknown>,
    { body: { good_id: number; qty: number; warehouse_id: number } }
  >({
    method: 'post',
    url: tmzGoodEndpoints.cart,
    options: {
      onSuccess: () => {
        invalidate(goodsId);
        snackbar.show({ title: 'Товар добавлен в корзину', type: 'success' });
        onSuccess?.();
      },
    },
  });
  return mutation;
};

export const useUpdateTmzCartItem = () => {
  const mutation = useMutationQuery<
    ApiResponse<unknown>,
    { body: { good_id: number; qty: number; warehouse_id: number } }
  >({
    method: 'put',
    url: tmzGoodEndpoints.cart,
    options: { onSuccess: () => invalidate() },
  });
  return mutation;
};

export const useRemoveTmzCartItems = () => {
  const mutation = useMutationQuery<
    ApiResponse<unknown>,
    { body: Array<{ good_id: number; warehouse_id: number }> }
  >({
    method: 'post',
    url: tmzGoodEndpoints.cartClear,
    options: { onSuccess: () => invalidate() },
  });
  return mutation;
};

export const useTmzGoodOperation = (
  kind: 'move' | 'distribute' | 'cart',
  goodsId?: number | string,
  onSuccess?: () => void,
) => {
  const url =
    kind === 'move'
      ? tmzGoodEndpoints.move
      : kind === 'distribute'
        ? tmzGoodEndpoints.distribute
        : tmzGoodEndpoints.cartOperation;
  const mutation = useMutationQuery<
    Blob,
    { body: TmzGoodOperationPayload | TmzGoodOperationPayload[] }
  >({
    method: 'post',
    url,
    config: { responseType: 'blob' },
    options: {
      onSuccess: (blob) => {
        downloadBlob(blob, 'invoice.pdf');
        invalidate(goodsId);
        snackbar.show({ title: 'Операция выполнена', type: 'success' });
        onSuccess?.();
      },
    },
  });
  return mutation;
};
