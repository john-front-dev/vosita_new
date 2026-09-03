export type HistoryRecord = {
  date: number | string;
  id: number;
  initiator?: string;
  object_id?: number;
  type?: string;
};

export type HistoryDetails = {
  date?: number | string;
  description?: string;
  id?: number;
  initiator?: string;
  inventory_number?: string;
  new_alif_category?: string;
  new_comment?: string;
  new_department?: string;
  new_employee?: string;
  new_employee_uuid?: string;
  new_name?: string;
  new_price?: number | string;
  new_responsible_person?: string;
  new_room?: string;
  new_status?: string;
  new_subdivision?: string;
  new_warehouse_manager?: string;
  new_warhouse_manager_id?: number | string;
  old_comment?: string;
  old_employee?: string;
  old_employee_uuid?: string;
  old_name?: string;
  old_responsible_person?: string;
  old_room?: string;
  old_status?: string;
  old_warehouse_manager?: string;
  old_warhouse_manager_id?: number | string;
  operation_type?: string;
};

export type HistoryListPayload = {
  data: HistoryRecord[];
  page?: number;
  total_count?: number;
  total_pages: number;
};

export type HistoryListResponse = ApiResponse<HistoryListPayload>;

export type HistoryDetailsPayload = HistoryDetails | { payload?: HistoryDetails[] };
export type HistoryDetailsResponse = ApiResponse<HistoryDetailsPayload>;

export const historyFilterKeys = [
  'warehouse_id',
  'operation_type',
  'initiator',
  'start_date',
  'end_date',
] as const;

export type HistoryFilterKey = (typeof historyFilterKeys)[number];
export type HistoryFilters = Record<HistoryFilterKey, string[]>;

export type HistoryListParams = {
  end_date?: string;
  initiator?: string;
  limit: number;
  operation_type?: string;
  page: number;
  search_text?: string;
  start_date?: string;
  warehouse_id?: string;
};
