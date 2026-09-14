export type NotificationSetting = {
  cat_id: number;
  current_qty: number;
  enabled: boolean;
  goods_id: number;
  goods_name: string;
  min_qty: number;
  notified: boolean;
  storage_id: number;
};

export type NotificationItemPayload = {
  cat_id?: number;
  goods_id?: number;
  goods_name?: string;
  min_qty?: number;
  qty?: number;
  storage_id?: number;
  storage_name?: string;
  unit?: string;
  [key: string]: unknown;
};

export type NotificationItem = {
  created_at: string;
  entity_id: number;
  entity_type: string;
  id: number;
  is_read: boolean;
  message: string;
  payload: NotificationItemPayload;
  read_at: string | null;
  storage_id: number;
  type: string;
};

export type NotificationListPayload = {
  data: NotificationItem[];
  page: number;
  total_pages: number;
  unread_count: number;
};

export type NotificationListParams = {
  limit?: number;
  only_unread?: boolean;
  page?: number;
};

export type NotificationSettingResponse = ApiResponse<NotificationSetting>;
export type NotificationListResponse = ApiResponse<NotificationListPayload>;
export type NotificationCountResponse = ApiResponse<{ unread_count: number }>;
