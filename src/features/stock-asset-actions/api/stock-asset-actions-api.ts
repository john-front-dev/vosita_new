import type { StockAssetType } from '@entities/stock-asset';
import { apiRoutes } from '@shared/api/routes';

const getAssetSegment = (type: StockAssetType) => (type === 'lri' ? 'pau' : 'os');

export const stockAssetActionEndpoints = {
  delete: apiRoutes.stockAssetActions.delete,
  edit: (id: number | string, type: StockAssetType) =>
    apiRoutes.stockAssetActions.edit(id, getAssetSegment(type)),
  issue: (id: number | string, type: StockAssetType) =>
    apiRoutes.stockAssetActions.issue(id, getAssetSegment(type)),
  repair: apiRoutes.stockAssetActions.repair,
} as const;
