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

export type TmzGoodsPayload = {
  current_page?: number;
  data: TmzGood[];
  page?: number;
  total_count?: number;
  total_pages: number;
};

export type TmzGoodsResponse = ApiResponse<TmzGoodsPayload>;
