declare global {
  type ApiResponse<TPayload = unknown> = {
    code: number;
    message?: string;
    payload: TPayload;
  };

  type ApiErrorPayload = {
    message?: string;
    payload?: {
      message?: string;
    };
  };

  type PaginationMeta = {
    current_page?: number;
    page?: number;
    per_page?: number;
    total_count?: number;
    total_pages?: number;
  };

  type PaginatedPayload<T> = Omit<PaginationMeta, 'per_page' | 'total_pages'> & {
    data: T[];
    total_pages: number;
  };
}

export {};
