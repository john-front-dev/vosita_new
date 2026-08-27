export type TmzReportEntry = {
  category_name?: string;
  moved_qty?: number;
  moved_sum?: number;
  to_storage_name?: string;
  total_expense_sum?: number;
  total_expenses?: number;
};

export type TmzReportRecord = {
  canceled_reserved_qty?: number;
  canceled_reserved_sum?: number;
  end_stock?: number;
  end_stock_sum?: number;
  expensed_data?: TmzReportEntry[];
  expensed_qty?: number;
  expensed_sum?: number;
  moved_data?: TmzReportEntry[];
  name?: string;
  price?: number;
  received_date?: string;
  received_qty?: number;
  received_sum?: number;
  reserved_qty?: number;
  reserved_sum?: number;
  start_stock?: number;
  start_stock_sum?: number;
  unit?: string;
  [key: string]: unknown;
};

export type TmzReportResponse = ApiResponse<TmzReportRecord[]>;

export type TmzReportParams = {
  from_date: string;
  storage_id: number;
  to_date: string;
};
