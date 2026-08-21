export type WarehouseManager = {
  user_id: string;
  user_name: string;
};

export type WarehouseManagersResponse = ApiResponse<WarehouseManager[]>;

export type Employee = { id: number | string; full_name: string };
export type EmployeesResponse = ApiResponse<{ data?: Employee[] } | Employee[]>;
