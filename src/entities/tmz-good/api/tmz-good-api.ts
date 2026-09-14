export const tmzGoodEndpoints = {
  cart: '/tmz/cart',
  cartClear: '/tmz/cart/clear',
  cartOperation: '/tmz/cart/operation',
  details: (goodsId: number | string) => `/remains/goods/${goodsId}`,
  distribute: '/remains',
  history: (goodsId: number | string, storageId: number | string) =>
    `/remains/history/${goodsId}/${storageId}`,
  historyReport: (goodsId: number | string, storageId: number | string) =>
    `/remains/history/${goodsId}/${storageId}`,
  invoice: (remainId: number | string) => `/invoice/remains/${remainId}`,
  move: '/remains_move',
} as const;
