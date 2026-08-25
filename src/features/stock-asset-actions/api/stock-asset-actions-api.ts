import type { StockAssetType } from '@entities/stock-asset';

const getAssetSegment = (type: StockAssetType) => (type === 'lri' ? 'pau' : 'os');

export const stockAssetActionEndpoints = {
  delete: (id: number | string) => `/accountant/os/delete/${id}`,
  edit: (id: number | string, type: StockAssetType) =>
    `/accountant/${getAssetSegment(type)}/edit/${id}`,
  issue: (id: number | string, type: StockAssetType) =>
    `/accountant/${getAssetSegment(type)}/issue/${id}`,
  repair: (id: number | string) => `/accountant/os/repair/${id}`,
} as const;
