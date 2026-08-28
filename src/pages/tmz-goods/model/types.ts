export type TmzGood = {
  cat_id: number;
  date?: string;
  goods_id: number;
  goods_name: string;
  price: number;
  total_price: number;
  total_qty: number;
  unit: string;
};

export type TmzGoodsPayload = PaginatedPayload<TmzGood>;

export type TmzGoodsResponse = ApiResponse<TmzGoodsPayload>;
