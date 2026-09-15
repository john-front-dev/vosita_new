export type AccessibleWarehouseDto = {
  dep_id: number;
  dep_name: string;
  storage_id: number;
  storage_name: string;
  sub_id: number;
  sub_name: string;
};

export type StorageDto = {
  created_at: string;
  department_id: number;
  department_name: string;
  expense_type_id: number | '';
  id: number;
  is_active: boolean;
  manager_id: number;
  name: string;
  responsible_id: string;
  responsible_name: string;
  storage_type: string;
  storage_type_id: number;
  subdivision_id: number;
  subdivision_name: string;
  updated_at: string;
};

export type WarehouseLocation = {
  department_id: number;
  department_name: string;
  storage_id: number;
  storage_name: string;
  subdivision_id: number;
  subdivision_name: string;
};

type ListPayload<T> =
  | T[]
  | {
      items?: T[];
    };

export type AccessibleWarehousesResponse = ApiResponse<ListPayload<AccessibleWarehouseDto>>;
export type StoragesResponse = ApiResponse<ListPayload<StorageDto>>;

export type LocationOption = {
  label: string;
  value: string;
};

export type City = { id: number | string; name: string };
export type Building = { id: number | string; name?: string; build?: string };
export type Cabinet = { id: number | string; room: string };
export type LocationListResponse<T> = ApiResponse<{ data?: T[] } | T[]>;
