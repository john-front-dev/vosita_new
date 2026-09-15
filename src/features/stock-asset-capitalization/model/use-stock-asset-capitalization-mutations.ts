import { queryClient, useMutationQuery } from '@shared/api';

type AddCapitalizationPayload = {
  capitalization: number;
  comment: string;
  currency: string;
  date: string;
  object_id: number;
};

export const useStockAssetCapitalizationMutations = (
  assetId: number | string,
  onAdded?: () => void,
  onRemoved?: () => void,
) => {
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['stock-asset', String(assetId)] });
  };
  const { isPending: isAdding, mutate: addCapitalization } = useMutationQuery<ApiResponse<unknown>, { body: AddCapitalizationPayload }>({
    method: 'post',
    url: '/capitalization',
    options: {
      onSuccess: () => {
        invalidate();
        onAdded?.();
      },
    },
  });
  const { isPending: isRemoving, mutate: removeCapitalization } = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: '/capitalization/',
    options: {
      onSuccess: () => {
        invalidate();
        onRemoved?.();
      },
    },
  });

  return {
    addCapitalization: (body: AddCapitalizationPayload) => addCapitalization({ body }),
    isAdding,
    isRemoving,
    removeCapitalization: (id: number | string) =>
      removeCapitalization({ url: `/capitalization/${id}` }),
  };
};
