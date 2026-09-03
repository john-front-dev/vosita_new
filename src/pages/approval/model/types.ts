export type ApprovalRecord = {
  id: number;
  description?: string;
  from_department_name?: string;
  from_subdivision_name?: string;
  from_storage_name?: string;
  to_department_name?: string;
  to_subdivision_name?: string;
  to_storage_name?: string;
  quantity?: number | string | null;
  status_id: number;
  status_name?: string;
  operation_type_id: number;
  operation_type_name?: string;
  item_type_id: number;
  item_type_name?: string;
  invoice_number?: string;
  created_time?: string;
};

export type ApprovalListResponse = ApiResponse<{
  items: ApprovalRecord[];
  total_pages: number;
  current_page: number;
  total_count: number;
}>;

export const approvalFilterKeys = [
  'status_id',
  'operation_type_id',
  'item_type_id',
  'from_storage_id',
  'to_storage_id',
] as const;

export type ApprovalFilterKey = (typeof approvalFilterKeys)[number];
export type ApprovalFilters = Record<ApprovalFilterKey, string[]>;

export type ApprovalListParams = {
  limit: number;
  offset: number;
  search?: string;
  status_id?: string;
  operation_type_id?: string;
  item_type_id?: string;
  from_storage_id?: string;
  to_storage_id?: string;
};
