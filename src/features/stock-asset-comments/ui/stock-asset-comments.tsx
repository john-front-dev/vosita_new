import { useState } from 'react';
import { Button, Surface, TextArea, Typography } from 'alif-ui';

import type { StockAssetComment } from '@entities/stock-asset';
import { useStockAssetComments } from '@entities/stock-asset';
import { queryClient, useMutationQuery } from '@shared/api';
import { ConfirmModal } from '@shared/ui';

import { StockAssetCommentItem } from './stock-asset-comment-item';

type CommentTarget = {
  comment: string;
  id: number | string;
  parentId: number | string | null;
  subCommentId: number | string | null;
};

const emptyTarget: CommentTarget = { comment: '', id: '', parentId: null, subCommentId: null };

export const StockAssetComments = ({ assetId }: { assetId: string }) => {
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<CommentTarget | null>(null);
  const [editingTarget, setEditingTarget] = useState<CommentTarget | null>(null);
  const [removingComment, setRemovingComment] = useState<StockAssetComment | null>(null);
  const commentsQuery = useStockAssetComments(assetId);
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['stock-asset-comments', assetId] });
  const createComment = useMutationQuery<
    ApiResponse<unknown>,
    {
      body: {
        comment: string;
        parent_id: number | string | null;
        sub_com_id: number | string | null;
        warehouse_id: number;
      };
    }
  >({
    method: 'post',
    url: '/os/comment/',
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
    { body: { comment: string; id: number | string; warehouse_id: number } }
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
    { body: { id: number | string; warehouse_id: number } }
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
        body: { comment, id: editingTarget.id, warehouse_id: Number(assetId) },
      });
      return;
    }
    createComment.mutate({
      body: {
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
          {commentsQuery.isLoading && (
            <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
              Загрузка комментариев…
            </Typography>
          )}
          {!commentsQuery.isLoading && commentsQuery.comments.length === 0 && (
            <Typography
              category="body"
              proportions="s"
              className="text-center text-(--color-text-secondary)"
            >
              Пока комментариев нет
            </Typography>
          )}
          {commentsQuery.comments.map((comment) => (
            <StockAssetCommentItem
              key={comment.id}
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
          deleteComment.mutate({ body: { id: removingComment.id, warehouse_id: Number(assetId) } })
        }
      />
    </>
  );
};
