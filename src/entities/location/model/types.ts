export type AccessibleWarehouse = {
  department_id?: number;
  department_name?: string;
  dep_id?: number;
  dep_name?: string;
  id?: number;
  name?: string;
  storage_id: number;
  storage_name: string;
  sub_id?: number;
  sub_name?: string;
  subdivision_id?: number;
  subdivision_name?: string;
};

export type AccessibleWarehousesPayload =
  | AccessibleWarehouse[]
  | {
      items?: AccessibleWarehouse[];
    };

export type AccessibleWarehousesResponse = ApiResponse<AccessibleWarehousesPayload>;

export type LocationOption = {
  label: string;
  value: string;
};

export type City = { id: number | string; name: string };
export type Building = { id: number | string; name?: string; build?: string };
export type Cabinet = { id: number | string; room: string };
export type LocationListResponse<T> = ApiResponse<{ data?: T[] } | T[]>;
