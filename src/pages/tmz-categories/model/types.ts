export type TmzCategory = {
  category?: string;
  id: number;
  name?: string;
  storage_id?: number;
  total_price: number;
  total_qty: number;
};

export type TmzCategoriesPayload = Required<Pick<PaginationMeta, 'page' | 'total_pages'>> &
  Pick<PaginationMeta, 'total_count'> & {
    tmz: TmzCategory[];
    total_categories_sum: number;
  };

export type TmzCategoriesResponse = ApiResponse<TmzCategoriesPayload>;

export type TmzSearchGood = {
  goods_id: number;
  goods_name: string;
  price: number;
  total_price: number;
  total_qty: number;
  unit: string;
};

export type TmzSearchCategory = {
  category_id: number;
  category_name: string;
  objects: TmzSearchGood[];
};

export type TmzSearchResponse = ApiResponse<TmzSearchCategory[]>;

export type TmzCategoryRow = {
  categoryId: number;
  displayId: number;
  id: string;
  kind: 'category' | 'good';
  name: string;
  price?: number;
  storageId: number;
  totalPrice: number;
  totalQty: number;
  unit?: string;
  goodId?: number;
};
