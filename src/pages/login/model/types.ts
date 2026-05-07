import type { z } from 'zod';

import type { AuthAccess } from '@shared/lib';

import type { loginSchema } from './validation';

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginRequest = {
  email: string;
  password: string;
  is_remember_me: boolean;
};

export type LoginUser = {
  id: string;
  full_name: string;
  is_warehouse_manager: boolean;
  is_responsible_person: boolean;
  access: string;
  email: string;
};

export type LoginPayload = {
  auth: {
    user: LoginUser;
    access_token: string;
    refresh_token: string;
    is_default_password: boolean;
  };
  accesses: AuthAccess[];
};

export type LoginResponse = ApiResponse<LoginPayload>;
