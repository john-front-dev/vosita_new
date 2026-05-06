import {
  type QueryKey,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig } from 'axios';

import type { ApiErrorPayload } from './http-client';
import { httpClient } from './http-client';

type QueryParams = AxiosRequestConfig['params'];

type GetRequestConfig = Omit<AxiosRequestConfig, 'method' | 'params' | 'signal' | 'url'>;

type GetQueryOptions<TData, TError, TSelect> = Omit<
  UseQueryOptions<TData, TError, TSelect, QueryKey>,
  'queryFn' | 'queryKey'
>;

export type UseGetQueryParams<
  TData,
  TSelect = TData,
  TParams extends QueryParams = QueryParams,
  TError = AxiosError<ApiErrorPayload>,
> = {
  queryKey: QueryKey;
  url: string;
  params?: TParams;
  config?: GetRequestConfig;
  includeParamsInKey?: boolean;
  options?: GetQueryOptions<TData, TError, TSelect>;
};

const getQueryKey = <TParams extends QueryParams>(
  queryKey: QueryKey,
  params: TParams | undefined,
  includeParamsInKey: boolean,
): QueryKey => {
  if (!includeParamsInKey || params === undefined || params === null) {
    return queryKey;
  }

  return [...queryKey, params];
};

export function useGetQuery<
  TData,
  TSelect = TData,
  TParams extends QueryParams = QueryParams,
  TError = AxiosError<ApiErrorPayload>,
>({
  queryKey,
  url,
  params,
  config,
  includeParamsInKey = true,
  options,
}: UseGetQueryParams<TData, TSelect, TParams, TError>): UseQueryResult<TSelect, TError> {
  return useQuery<TData, TError, TSelect, QueryKey>({
    queryKey: getQueryKey(queryKey, params, includeParamsInKey),
    queryFn: ({ signal }) =>
      httpClient
        .get<TData>(url, {
          ...config,
          params,
          signal,
        })
        .then((response) => response.data),
    ...options,
  });
}
