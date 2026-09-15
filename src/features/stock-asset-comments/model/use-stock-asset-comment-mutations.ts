import type { AssetResource } from '@entities/stock-asset';
import { type MutationVariables, queryClient, useMutationQuery } from '@shared/api';

type ReplyTarget = {
  parentId: number | string | null;
  subCommentId: number | string | null;
};

type UseStockAssetCommentMutationsParams = {
  assetId: string;
  onCreated: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
  resource: AssetResource;
};

export const useStockAssetCommentMutations = ({
  assetId,
  onCreated,
  onDeleted,
  onUpdated,
  resource,
}: UseStockAssetCommentMutationsParams) => {
  const isMbp = resource === 'mbp';
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['asset-comments', resource, assetId] });
  const { isPending: isCreating, mutate: createComment } = useMutationQuery<
    ApiResponse<unknown>,
    MutationVariables<Record<string, unknown>>
  >({
    method: 'post',
    url: isMbp ? '/mbp/item/comment' : '/os/comment/',
    options: { onSuccess: () => void invalidate().then(onCreated) },
  });
  const { isPending: isUpdating, mutate: updateComment } = useMutationQuery<
    ApiResponse<unknown>,
    MutationVariables<Record<string, unknown>>
  >({
    method: 'put',
    url: '/os/comment/',
    options: { onSuccess: () => void invalidate().then(onUpdated) },
  });
  const { isPending: isDeleting, mutate: deleteComment } = useMutationQuery<
    ApiResponse<unknown>,
    MutationVariables<Record<string, unknown>>
  >({
    method: 'delete',
    url: '/os/comment/',
    options: { onSuccess: () => void invalidate().then(onDeleted) },
  });

  return {
    createComment: (comment: string, replyTarget?: ReplyTarget | null) =>
      createComment({
        body: isMbp
          ? { comment, item_id: Number(assetId) }
          : {
              comment,
              parent_id: replyTarget?.parentId ?? null,
              sub_com_id: replyTarget?.subCommentId ?? null,
              warehouse_id: Number(assetId),
            },
      }),
    deleteComment: (id: number | string) =>
      deleteComment({
        body: isMbp ? undefined : { id, warehouse_id: Number(assetId) },
        url: isMbp ? `/mbp/comment/${id}` : undefined,
      }),
    isDeleting,
    isSubmitting: isCreating || isUpdating,
    updateComment: (id: number | string, comment: string) =>
      updateComment({
        body: isMbp ? { comment, id } : { comment, id, warehouse_id: Number(assetId) },
        url: isMbp ? `/mbp/comment/${id}` : undefined,
      }),
  };
};
