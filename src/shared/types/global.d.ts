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
}

export {};
