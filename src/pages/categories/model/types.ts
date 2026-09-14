export const categoryTypes = ['os', 'tmz', 'mbp'] as const;
export type CategoryType = (typeof categoryTypes)[number];
export const isCategoryType = (value: string | null): value is CategoryType =>
  categoryTypes.includes(value as CategoryType);

export type OsCategory = {
  depreciation_rate: number;
  id: number;
  name: string;
  tax_group_id: number;
  tax_group_name?: string;
};

export type TmzCategory = {
  id: number;
  name: string;
  storage_count: number;
};

export type MbpCategory = {
  created_at?: string;
  id: number;
  is_destroyable: boolean;
  name: string;
  updated_at?: string;
};

export type CategoryRecord = OsCategory | TmzCategory | MbpCategory;

export type CategoryListPayload = PaginationMeta & {
  data?: CategoryRecord[];
  tmz?: CategoryRecord[];
};

export type CategoryListResponse = ApiResponse<CategoryListPayload>;

export type StorageOption = { id: number; name: string };
export type ExpenseType = {
  accountNumber?: string;
  branchName?: string;
  expenseType: string;
  id: string;
};

export type TmzCategoryDetails = {
  accountant_number: string;
  branch_name: string;
  category_id: number;
  expense_type_id: string;
  id: number;
  name: string;
  storage_id: number;
  storage_name: string;
};
