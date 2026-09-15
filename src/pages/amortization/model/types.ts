export type AmortizationType = 'fixed-assets' | 'lri';

export type AmortizationRecord = {
  id: number | string;
  currency?: string;
  mounts?: Array<{ month: string; price: number | string; year: number | string }>;
  year?: Array<{ total_for_year: number | string; year: number | string }>;
  [key: string]: unknown;
};

export type AmortizationFilters = {
  BUILDING_ID: string;
  CATEGORY_ID: string;
  CITY_ID: string;
  RESPONSIBLE_PERSON_ID: string;
  ROOM_ID: string;
  STATUS_ID: string;
};

export type AmortizationFormValues = {
  filters: AmortizationFilters;
  from: Date;
  searchText: string;
  to: Date;
};

export type UseAmortizationListParams = {
  filters: AmortizationFilters;
  from: string;
  searchText: string;
  to: string;
  type: AmortizationType;
};

export type AmortizationPayload = PaginatedPayload<AmortizationRecord>;

export type AmortizationResponse = ApiResponse<AmortizationPayload | AmortizationRecord[]>;
