import type { ReactNode } from 'react';

export type ApplicationListType = 'fixed-assets' | 'lri' | 'tmz' | 'mbp' | 'other';

export type ApplicationDetailsStatus = 'accepted' | 'not-reviewed' | 'paid';

export type ApplicationFilterKey = 'DEPARTMENT_ID' | 'STORAGE_ID' | 'SUBDIVISION_ID';

export type ApplicationFilters = Record<ApplicationFilterKey, string[]>;

export type ApplicationTab = {
  icon: ReactNode;
  label: string;
  storageType: string;
  value: ApplicationListType;
};

export type ApplicationListParams = {
  DEPARTMENT_ID?: string[];
  LIMIT: number;
  PAGE: number;
  SEARCH_TEXT?: string;
  STORAGE_ID?: string[];
  SUBDIVISION_ID?: string[];
};

export type ApplicationRecord = {
  applicant?: string;
  date?: string;
  id: number;
  reviewed_objects?: {
    count: number;
    from: number;
  };
  storage_name?: string;
  subdivision_name?: string;
  title?: string;
};

export type ApplicationListPayload = PaginatedPayload<ApplicationRecord>;

export type ApplicationListResponse = ApiResponse<ApplicationListPayload>;

export type CreateApplicationRequest = {
  category: number;
  description?: string;
  storage_id: number;
  title: string;
};

export type ApplicationDetailsParams = {
  limit: number;
  page: number;
  status: number;
};

export type ApplicationObjectRecord = {
  category?: string;
  currency?: string;
  date?: number | string;
  department_name?: string;
  id: number;
  name?: string;
  price?: number;
  quantity?: number;
  receipt?: string;
  status?: string;
  storage_name?: string;
  subdivision_name?: string;
  total_sum?: number;
  tmz_cat_id?: number;
  unit?: string;
};

export type ApplicationDetailsPayload = Pick<PaginationMeta, 'total_pages'> & {
  applicant?: {
    id: number;
    name: string;
  };
  count?: {
    accepted_count?: number;
    paid_count?: number;
    received_count?: number;
    total_count?: number;
    total_rub?: number;
    total_tjs?: number;
    total_usd?: number;
  };
  date?: number | string;
  description?: string;
  id: number;
  objects?: ApplicationObjectRecord[];
  status?: string;
  storage_name?: string;
  title: string;
  tmz_cat_name?: string;
};

export type ApplicationDetailsResponse = ApiResponse<ApplicationDetailsPayload>;

export type ApplicationInvoiceItem = {
  name: string;
  price: number;
  quantity: number;
  unit?: string;
};

export type ApplicationInvoice = {
  created_at: string;
  id: number;
  initiator_id: string;
  initiator_name: string;
  invoice_number: string;
  objects: ApplicationInvoiceItem[];
};

export type ApplicationInvoicesResponse = ApiResponse<ApplicationInvoice[]>;

export type CreateSubrequestRequest = {
  name: string;
  price: number;
  quantity: number;
  request_id: number;
  tmz_cat_id: number;
  unit: string;
};

export type UpdateSubrequestRequest = Pick<CreateSubrequestRequest, 'name' | 'price'>;

export type IssueApplicationObjectsRequest = {
  objects: {
    id: number;
  }[];
  registration_date: string;
};

export type TmzCategory = {
  id: number;
  name: string;
};

export type TmzCategoriesPayload =
  | TmzCategory[]
  | {
      tmz?: TmzCategory[];
    };

export type TmzCategoriesResponse = ApiResponse<TmzCategoriesPayload>;
