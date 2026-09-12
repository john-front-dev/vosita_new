export type WarehouseManager = {
  user_id: string;
  user_name: string;
};

export type WarehouseManagersResponse = ApiResponse<WarehouseManager[]>;

export type Employee = {
  access?: string;
  active?: boolean;
  full_name: string;
  id: number | string;
  manual?: boolean;
  role_id?: number;
  user_id?: string;
};

export type EmployeesPayload = {
  data?: Employee[];
  page?: number;
  total_count?: number;
  total_pages?: number;
};

export type EmployeesResponse = ApiResponse<EmployeesPayload | Employee[]>;

export type EmployeeAsset = {
  building?: string;
  category?: { name?: string };
  currency?: string;
  id: number | string;
  inventory_number?: string;
  name: string;
  price?: number;
  status_id?: number;
};

export type EmployeeAssetList = {
  data?: EmployeeAsset[];
  page?: number;
  total_count?: number;
  total_pages?: number;
} | null;

export type EmployeeDetails = Employee & {
  consumables?: Array<{ accept: boolean; id: number; title: string }>;
  email?: string;
  personal_items?: EmployeeAssetList;
  stock_items?: EmployeeAssetList;
  under_responsibility_items?: EmployeeAssetList;
};

export type EmployeeDetailsResponse = ApiResponse<EmployeeDetails>;

export type EmployeeFixedAssetHistory = {
  history_date?: string;
  inventory_number?: string;
  old_employee_id?: string;
  old_employee_name?: string;
  operation_name?: string;
  warehouse_id: number;
  warehouse_name?: string;
};

export type EmployeeMbpHistory = {
  created_at?: string;
  history_id?: number;
  id: number;
  mbp_item_name?: string;
  new_employee_name?: string;
  old_employee_name?: string;
};

export type EmployeeUserAction = {
  created_at?: string;
  id: number;
  inventory_number?: string;
  new_employee_name?: string;
  old_employee_name?: string;
  operation_name?: string;
  warehouse_name?: string;
};

export type EmployeeLocationAccess = {
  storage_type: string;
  storages_ids: number[];
};

export type EmployeeWarehouseAccessResponse = ApiResponse<{
  employee_permissions?: Array<{
    storage_type: string;
    storages: Array<{ id: number; name: string }>;
    user_id: string;
  }>;
  partial_permissions?: {
    department_ides?: number[];
    subdivision_ides?: number[];
  };
}>;
