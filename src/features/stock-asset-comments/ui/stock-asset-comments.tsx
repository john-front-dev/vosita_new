import { useState } from 'react';
import { Button, Loader, Surface, TextArea, Typography } from 'alif-ui';

import type { AssetResource, StockAssetComment } from '@entities/stock-asset';
import { useStockAssetComments } from '@entities/stock-asset';
import { type MutationVariables, queryClient, useMutationQuery } from '@shared/api';
import { ConfirmModal } from '@shared/ui';

import { StockAssetCommentItem } from './stock-asset-comment-item';

type CommentTarget = {
  comment: string;
  id: number | string;
  parentId: number | string | null;
  subCommentId: number | string | null;
};

const emptyTarget: CommentTarget = { comment: '', id: '', parentId: null, subCommentId: null };

export const StockAssetComments = ({
  assetId,
  resource = 'stock-asset',
}: {
  assetId: string;
  resource?: AssetResource;
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<CommentTarget | null>(null);
  const [editingTarget, setEditingTarget] = useState<CommentTarget | null>(null);
  const [removingComment, setRemovingComment] = useState<StockAssetComment | null>(null);
  const { comments, isLoading } = useStockAssetComments(assetId, true, resource);
  const isMbp = resource === 'mbp';
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['asset-comments', resource, assetId] });
  const createComment = useMutationQuery<
    ApiResponse<unknown>,
    MutationVariables<Record<string, unknown>>
  >({
    method: 'post',
    url: isMbp ? '/mbp/item/comment' : '/os/comment/',
    options: {
      onSuccess: () => {
        setCommentText('');
        setReplyTarget(null);
        invalidate();
      },
    },
  });
  const updateComment = useMutationQuery<
    ApiResponse<unknown>,
    MutationVariables<Record<string, unknown>>
  >({
    method: 'put',
    url: '/os/comment/',
    options: {
      onSuccess: () => {
        setCommentText('');
        setEditingTarget(null);
        invalidate();
      },
    },
  });
  const deleteComment = useMutationQuery<
    ApiResponse<unknown>,
    MutationVariables<Record<string, unknown>>
  >({
    method: 'delete',
    url: '/os/comment/',
    options: {
      onSuccess: () => {
        setRemovingComment(null);
        invalidate();
      },
    },
  });
  const composerTarget = editingTarget ?? replyTarget;
  const isSubmitting = createComment.isPending || updateComment.isPending;

  const startReply = (comment: StockAssetComment, parentComment?: StockAssetComment) => {
    setEditingTarget(null);
    setCommentText('');
    setReplyTarget({
      ...emptyTarget,
      comment: comment.comment,
      id: comment.id,
      parentId: parentComment?.id ?? comment.id,
      subCommentId: parentComment ? comment.id : null,
    });
  };

  const startEdit = (comment: StockAssetComment) => {
    setReplyTarget(null);
    setEditingTarget({ ...emptyTarget, comment: comment.comment, id: comment.id });
    setCommentText(comment.comment);
  };

  const submit = () => {
    const comment = commentText.trim();
    if (!comment) return;
    if (editingTarget) {
      updateComment.mutate({
        body: isMbp
          ? { comment, id: editingTarget.id }
          : { comment, id: editingTarget.id, warehouse_id: Number(assetId) },
        url: isMbp ? `/mbp/comment/${editingTarget.id}` : undefined,
      });
      return;
    }
    createComment.mutate({
      body: isMbp
        ? { comment, item_id: Number(assetId) }
        : {
            comment,
            parent_id: replyTarget?.parentId ?? null,
            sub_com_id: replyTarget?.subCommentId ?? null,
            warehouse_id: Number(assetId),
          },
    });
  };

  const cancelComposerMode = () => {
    setReplyTarget(null);
    setEditingTarget(null);
    setCommentText('');
  };

  return (
    <>
      <Surface className="flex flex-col gap-5" p="5" rounded="12">
        {composerTarget && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-(--color-bg-subtle) px-4 py-3">
            <Typography
              element="div"
              category="body"
              proportions="s"
              className="truncate text-(--color-text-secondary)"
            >
              {editingTarget ? 'Редактирование комментария' : `Ответ: ${replyTarget?.comment}`}
            </Typography>
            <Button type="button" variant="tertiary" size="s" onClick={cancelComposerMode}>
              Отмена
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <TextArea
            label="Комментарий"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Добавьте комментарий..."
            fullWidth
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="s"
              disabled={!commentText.trim() || isSubmitting}
              isLoading={isSubmitting}
              onClick={submit}
            >
              {editingTarget ? 'Сохранить' : 'Отправить'}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Typography
            element="div"
            category="body"
            proportions="sStrong"
            className="text-(--color-text-primary)"
          >
            Последние комментарии
          </Typography>
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader />
            </div>
          )}
          {!isLoading && comments.length === 0 && (
            <Typography
              category="body"
              proportions="s"
              className="text-center text-(--color-text-secondary)"
            >
              Пока комментариев нет
            </Typography>
          )}
          {comments.map((comment) => (
            <StockAssetCommentItem
              key={comment.id}
              canReply={!isMbp}
              comment={comment}
              onReply={startReply}
              onEdit={startEdit}
              onDelete={setRemovingComment}
            />
          ))}
        </div>
      </Surface>
      <ConfirmModal
        isOpen={removingComment !== null}
        title="Удалить комментарий?"
        message="Комментарий будет удалён без возможности восстановления."
        confirmText="Удалить"
        variant="risk"
        isConfirmLoading={deleteComment.isPending}
        onClose={() => setRemovingComment(null)}
        onConfirm={() =>
          removingComment &&
          deleteComment.mutate({
            body: isMbp ? undefined : { id: removingComment.id, warehouse_id: Number(assetId) },
            url: isMbp ? `/mbp/comment/${removingComment.id}` : undefined,
          })
        }
      />
    </>
  );
};
