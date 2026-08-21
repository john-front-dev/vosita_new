import type { StockAssetType } from '@entities/stock-asset';
import { queryClient, useMutationQuery } from '@shared/api';

import { stockAssetActionEndpoints } from '../api/stock-asset-actions-api';

type ActionParams = {
  assetId: number | string;
  onSuccess?: () => void;
};

type TypedActionParams = ActionParams & {
  type: StockAssetType;
};

const invalidateStockAsset = (assetId: number | string) =>
  queryClient.invalidateQueries({ queryKey: ['stock-asset', String(assetId)] });

export const useStockAssetRepair = ({ assetId, onSuccess }: ActionParams) => {
  const mutation = useMutationQuery<ApiResponse<unknown>>({
    method: 'post',
    url: stockAssetActionEndpoints.repair(assetId),
    options: {
      onSuccess: () => {
        onSuccess?.();
        invalidateStockAsset(assetId);
      },
    },
  });

  return { isRepairing: mutation.isPending, repair: () => mutation.mutate({}) };
};

export const useStockAssetDelete = ({ assetId, onSuccess }: ActionParams) => {
  const mutation = useMutationQuery<ApiResponse<unknown>>({
    method: 'delete',
    url: stockAssetActionEndpoints.delete(assetId),
    options: { onSuccess },
  });

  return { deleteAsset: () => mutation.mutate({}), isDeleting: mutation.isPending };
};

export const useStockAssetEdit = ({ assetId, onSuccess, type }: TypedActionParams) => {
  const mutation = useMutationQuery<ApiResponse<unknown>, { body: Record<string, unknown> }>({
    method: 'post',
    url: stockAssetActionEndpoints.edit(assetId, type),
    options: {
      onSuccess: () => {
        onSuccess?.();
        invalidateStockAsset(assetId);
      },
    },
  });

  return {
    editAsset: (body: Record<string, unknown>) => mutation.mutate({ body }),
    isEditing: mutation.isPending,
  };
};

export const useStockAssetIssue = ({ assetId, onSuccess, type }: TypedActionParams) => {
  const mutation = useMutationQuery<ApiResponse<unknown>, { body: FormData }>({
    method: 'post',
    url: stockAssetActionEndpoints.issue(assetId, type),
    options: {
      onSuccess: () => {
        onSuccess?.();
        invalidateStockAsset(assetId);
      },
    },
  });

  const issue = (field: 'responsible_id' | 'warehouse_manager_id', userId: string) => {
    const body = new FormData();

    body.append(field, userId);
    mutation.mutate({ body });
  };

  return {
    isIssuing: mutation.isPending,
    issueToEmployee: (userId: string) => issue('responsible_id', userId),
    issueToWarehouse: (userId: string) => issue('warehouse_manager_id', userId),
  };
};
