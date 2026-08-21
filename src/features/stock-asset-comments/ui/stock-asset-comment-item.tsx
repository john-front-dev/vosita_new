import { useState } from 'react';
import { Avatar, Button, Menu, OutlineSystemMoreVertical, Typography } from 'alif-ui';

import type { StockAssetComment } from '@entities/stock-asset';
import { formatDate } from '@shared/lib';

type StockAssetCommentItemProps = {
  comment: StockAssetComment;
  parentComment?: StockAssetComment;
  onDelete: (comment: StockAssetComment) => void;
  onEdit: (comment: StockAssetComment) => void;
  onReply: (comment: StockAssetComment, parentComment?: StockAssetComment) => void;
};

export const StockAssetCommentItem = ({
  comment,
  parentComment,
  onDelete,
  onEdit,
  onReply,
}: StockAssetCommentItemProps) => {
  const [areRepliesOpen, setAreRepliesOpen] = useState(false);
  const repliesCount = comment.replies?.length ?? 0;

  return (
    <article
      className={
        parentComment
          ? 'ml-6 border-l-2 border-(--color-border-default) pl-4'
          : 'rounded-lg border border-(--color-border-default) p-4'
      }
    >
      <div className="flex items-start gap-3">
        <Avatar
          size="s"
          placeholderContent={comment.full_name?.trim().charAt(0).toUpperCase() || 'П'}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Typography
              element="div"
              category="body"
              proportions="sStrong"
              className="text-(--color-primary)"
            >
              {comment.full_name || 'Пользователь'}
            </Typography>
            <div className="flex shrink-0 items-center gap-1">
              <Typography
                element="div"
                category="body"
                proportions="xs"
                className="text-(--color-text-disabled)"
              >
                {formatDate(comment.date, 'ru', { withTime: true })}
              </Typography>
              <Menu
                trigger={
                  <OutlineSystemMoreVertical
                    className="cursor-pointer text-(--color-text-secondary)"
                    fill="currentColor"
                    width="20"
                    height="20"
                  />
                }
              >
                <Menu.Item onClick={() => onEdit(comment)}>Редактировать</Menu.Item>
                <Menu.Item onClick={() => onDelete(comment)}>Удалить</Menu.Item>
              </Menu>
            </div>
          </div>
          <Typography
            element="div"
            category="body"
            proportions="s"
            className="mt-2 whitespace-pre-wrap text-(--color-text-body)"
          >
            {comment.comment}
          </Typography>
          <div className="mt-3 flex flex-wrap gap-1">
            <Button
              type="button"
              variant="tertiary"
              size="s"
              onClick={() => onReply(comment, parentComment)}
            >
              Ответить
            </Button>
          </div>
        </div>
      </div>
      {repliesCount > 0 && (
        <div className="mt-4">
          <Button
            type="button"
            variant="tertiary"
            size="s"
            onClick={() => setAreRepliesOpen((isOpen) => !isOpen)}
          >
            {areRepliesOpen ? 'Скрыть ответы' : `Показать ответы (${repliesCount})`}
          </Button>
          {areRepliesOpen && (
            <div className="mt-4 flex flex-col gap-4">
              {comment.replies?.map((reply) => (
                <StockAssetCommentItem
                  key={reply.id}
                  comment={reply}
                  parentComment={parentComment ?? comment}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
