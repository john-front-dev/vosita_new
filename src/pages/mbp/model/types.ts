export type MbpRecord = {
  id: number;
  name?: string;
  inventory_number?: string;
  responsible_id?: number | string;
  responsible_name?: string;
  department_id?: number | string;
  department_name?: string;
  subdivision_id?: number | string;
  subdivision_name?: string;
  storage_id?: number | string;
  storage_name?: string;
  rooms_id?: number | string;
  rooms_name?: string;
  status?: number;
  status_name?: string;
  updated_at?: string;
};

export type MbpListPayload = {
  items?: MbpRecord[];
  data?: MbpRecord[];
  page?: number;
  page_size?: number;
  total?: number;
  total_count?: number;
  total_pages?: number;
};

export type MbpListResponse = ApiResponse<MbpListPayload>;
