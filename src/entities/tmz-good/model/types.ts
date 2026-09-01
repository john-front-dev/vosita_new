export type TmzGoodRemain = {
  cat_id: number;
  created_at?: string;
  date: string;
  from_department: number;
  from_department_name: string;
  from_storage: number | string;
  from_storage_name: string;
  from_subdivision: number;
  from_subdivision_name: string;
  goods_id: number;
  id: number;
  item_type_id: number;
  item_type_name: string;
  name: string;
  total_price: number;
  total_qty: number;
  unit: string;
};

export type TmzGoodHistory = {
  date: string;
  from_room?: string;
  from_subdivision?: string;
  id: number;
  invoice_number?: string | number;
  operation_type: string;
  previous_quantity?: number;
  price: number;
  quantity?: number;
  qty?: number;
  to_cabinet_name?: string;
  to_department_name?: string;
  to_storage_name?: string;
  to_subdivision_name?: string;
  total_qty?: number;
};

export type TmzCartItem = {
  department_id: number;
  department_name: string;
  good_id: number;
  id: number;
  item_type: number;
  item_type_name: string;
  name: string;
  price: number;
  qty: number;
  subdivision_id: number;
  subdivision_name: string;
  unit: string;
  warehouse: string;
  warehouse_id: number;
};

export type TmzGoodOperationPayload = {
  from_department: number;
  from_storage: number;
  from_subdivision: number;
  goods_id: number;
  operation_type: 'перемещение' | 'расход';
  party_items?: Array<{
    amortization_cat_id: number;
    exploiter_id: number | string;
    responsible_id: number | string;
    serial_number?: string;
  }>;
  qty: number;
  to_cabinet?: number;
  to_department?: number;
  to_storage?: number;
  to_subdivision?: number;
};

export type TmzGoodRemainsResponse = ApiResponse<TmzGoodRemain[]>;
export type TmzGoodHistoryResponse = ApiResponse<TmzGoodHistory[]>;
export type TmzCartResponse = ApiResponse<TmzCartItem[]>;
