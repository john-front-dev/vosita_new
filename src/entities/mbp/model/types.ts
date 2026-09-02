export type MbpRecord = {
  department_id?: number | string;
  department_name?: string;
  id: number;
  inventory_number?: string;
  name?: string;
  responsible_id?: number | string;
  responsible_name?: string;
  rooms_id?: number | string;
  rooms_name?: string;
  status?: number;
  status_name?: string;
  storage_id?: number | string;
  storage_name?: string;
  subdivision_id?: number | string;
  subdivision_name?: string;
  updated_at?: string;
};

export type MbpDetails = MbpRecord & {
  auto_accept?: boolean;
  auto_accept_confirmed?: boolean;
  category_id?: number | string;
  category_name?: string;
  comment?: string;
  created_at?: string;
  currency?: string;
  date?: string;
  employee_start_date?: string;
  is_repair?: boolean;
  is_stocktaking?: boolean;
  manager_id?: number | string;
  pending_approval?: boolean;
  price?: number;
  purchase_date?: string;
  quantity?: number;
  request_id?: number | string;
  serial_number?: string;
  unit?: string;
};

export type MbpDetailsResponse = ApiResponse<MbpDetails>;

export type MbpListPayload = {
  data?: MbpRecord[];
  items?: MbpRecord[];
  page?: number;
  page_size?: number;
  total?: number;
  total_count?: number;
  total_pages?: number;
};

export type MbpListResponse = ApiResponse<MbpListPayload>;
