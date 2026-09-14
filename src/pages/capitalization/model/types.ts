export type CapitalizationRecord = {
  id: number;
  capitalization: number;
  capitalization_month: number;
  capitalization_year: number;
  comment?: string | null;
  currency?: string | null;
  date?: number | string | null;
  warehouse_id?: number;
  warehouse_name?: string | null;
};

export type CapitalizationListParams = {
  LIMIT: number;
  NAME: string;
  PAGE: number;
};

export type CapitalizationListResponse = ApiResponse<PaginatedPayload<CapitalizationRecord>>;

export type CapitalizationDetailsResponse = ApiResponse<CapitalizationRecord>;
