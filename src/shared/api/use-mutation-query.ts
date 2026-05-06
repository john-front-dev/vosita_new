import {
  type MutationKey,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig } from 'axios';

import type { ApiErrorPayload } from './http-client';
import { httpClient } from './http-client';

export type MutationMethod = 'delete' | 'patch' | 'post' | 'put';

export type MutationVariables<TBody = unknown, TParams = AxiosRequestConfig['params']> = {
  body?: TBody;
  params?: TParams;
  url?: string;
  config?: Omit<AxiosRequestConfig, 'data' | 'method' | 'params' | 'url'>;
};

type MutationRequestConfig = Omit<AxiosRequestConfig, 'data' | 'method' | 'params' | 'url'>;

type MutationOptions<TData, TError, TVariables, TContext> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationFn' | 'mutationKey'
>;

export type UseMutationQueryParams<
  TData,
  TVariables extends MutationVariables = MutationVariables,
  TError = AxiosError<ApiErrorPayload>,
  TContext = unknown,
> = {
  method: MutationMethod;
  url: string;
  mutationKey?: MutationKey;
  config?: MutationRequestConfig;
  options?: MutationOptions<TData, TError, TVariables, TContext>;
};

export function useMutationQuery<
  TData,
  TVariables extends MutationVariables = MutationVariables,
  TError = AxiosError<ApiErrorPayload>,
  TContext = unknown,
>({
  method,
  url,
  mutationKey,
  config,
  options,
}: UseMutationQueryParams<TData, TVariables, TError, TContext>): UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
> {
  return useMutation<TData, TError, TVariables, TContext>({
    mutationKey,
    mutationFn: ({ body, params, url: variableUrl, config: variableConfig } = {} as TVariables) =>
      httpClient
        .request<TData>({
          ...config,
          ...variableConfig,
          method,
          url: variableUrl ?? url,
          data: body,
          params,
        })
        .then((response) => response.data),
    ...options,
  });
}
