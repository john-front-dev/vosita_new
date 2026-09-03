export type StockAssetCapitalization = {
  currency?: string;
  date?: number | string;
  description?: string;
  id: number | string;
  price?: number;
};

export type StockAssetHistoryItem = {
  created_at?: number | string;
  history_id: number | string;
  initiator_name?: string;
  operation_name?: string;
  operation_type?: string;
};

export type StockAssetHistoryDetails = {
  currency?: string;
  date?: number | string;
  description?: string;
  initiator?: string;
  inventory_number?: string;
  last_image_update?: string;
  new_alif_category?: string;
  new_comment?: string;
  new_department?: string;
  new_employee?: string;
  new_inventory_number?: string;
  new_name?: string;
  new_price?: number;
  new_responsible_person?: string;
  new_room?: string;
  new_serial_number?: string;
  new_status?: string;
  new_subdivision?: string;
  new_warehouse_manager?: string;
  old_alif_category?: string;
  old_comment?: string;
  old_department?: string;
  old_employee?: string;
  old_inventory_number?: string;
  old_name?: string;
  old_price?: number;
  old_responsible_person?: string;
  old_room?: string;
  old_serial_number?: string;
  old_status?: string;
  old_subdivision?: string;
  old_warehouse_manager?: string;
  operation_type?: string;
  serial_number?: string;
};

export type StockAssetComment = {
  childrenID?: Array<number | string>;
  comment: string;
  date?: number | string;
  created_at?: number | string;
  employee_name?: string;
  full_name?: string;
  id: number | string;
  is_edit?: boolean;
  is_edited?: boolean;
  parent_id?: number | string | null;
  replies?: StockAssetComment[];
  sub_com_id?: number | string | null;
};

export type AssetResource = 'mbp' | 'stock-asset';

export type StockAsset = {
  application_id?: number | string;
  building?: string;
  building_id?: number | string;
  cabinet?: string;
  cabinet_id?: number | string;
  category?: {
    name?: string;
    tax_group?: number | string;
  };
  category_name?: string;
  category_id?: number | string;
  city?: string;
  city_id?: number | string;
  currency?: string;
  date?: number | string;
  exploiter?: string;
  exploiter_id?: number | string;
  id: number | string;
  inventory_number?: string;
  images?: string[] | null;
  is_repair?: number;
  name: string;
  price?: number;
  receipt?: string;
  responsible_person?: string;
  responsible_person_id?: number | string;
  serial_number?: string;
  status_id?: number;
  capitalization?: StockAssetCapitalization[];
};

export type StockAssetResponse = ApiResponse<StockAsset>;
export type StockAssetHistoryResponse = ApiResponse<{
  historyList?: StockAssetHistoryItem[];
  page?: number;
  payload?: StockAssetHistoryItem[];
  totalItems?: number;
  totalPages?: number;
}> & {
  historyList?: StockAssetHistoryItem[];
};
export type StockAssetCommentsResponse = ApiResponse<StockAssetComment[]>;
export type StockAssetHistoryDetailsResponse = ApiResponse<{
  payload?: StockAssetHistoryDetails[];
}>;
export type StockAssetType = 'fixed-assets' | 'lri' | 'other';

export const isOsLikeStockAssetType = (type: StockAssetType) => type !== 'lri';
