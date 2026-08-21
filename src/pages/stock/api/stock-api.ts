import { apiRoutes } from '@shared/api/routes';

export const stockListEndpoints = apiRoutes.stock.list;

export const stockDownloadEndpoint = apiRoutes.stock.download;

export const serializeStockParams = (params: Record<string, string | number>) =>
  new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();

export const getStockRequestConfig = (params: Record<string, string | number>) => ({
  params,
  paramsSerializer: {
    serialize: (rawParams: unknown) =>
      serializeStockParams(rawParams as Record<string, string | number>),
  },
});
