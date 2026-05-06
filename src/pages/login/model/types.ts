import type { z } from 'zod';

import type { loginSchema } from './validation';

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginRequest = {
  email: string;
  password: string;
  is_remember_me: boolean;
};

export type LoginResponse = {
  code?: number;
  message?: string;
  payload?: {
    access_token?: string;
    refresh_token?: string;
    token?: string;
    user?: unknown;
  };
};
