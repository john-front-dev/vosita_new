export const stockListEndpoints = {
  'fixed-assets': '/accountant/os/',
  lri: '/accountant/os/',
} as const;

export const stockDownloadEndpoint = '/os/warehouse/excel/';

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
