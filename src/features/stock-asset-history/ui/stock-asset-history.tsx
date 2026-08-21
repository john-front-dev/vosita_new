import { useState } from 'react';
import { Surface, Typography } from 'alif-ui';

import { useStockAssetHistory } from '@entities/stock-asset';
import { formatDate } from '@shared/lib';

import { StockAssetHistoryDetailsModal } from './stock-asset-history-details-modal';

export const StockAssetHistory = ({ assetId }: { assetId: string }) => {
  const historyQuery = useStockAssetHistory(assetId);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | string | null>(null);

  return (
    <Surface className="flex flex-col gap-3" p="4" rounded="12">
      {historyQuery.isLoading && (
        <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
          Загрузка истории…
        </Typography>
      )}
      {!historyQuery.isLoading && historyQuery.history.length === 0 && (
        <Typography
          category="body"
          proportions="s"
          className="text-center text-(--color-text-secondary)"
        >
          Нет истории событий
        </Typography>
      )}
      {historyQuery.history.map((item) => (
        <button
          key={item.history_id}
          type="button"
          onClick={() => setSelectedHistoryId(item.history_id)}
          className="grid w-full cursor-pointer gap-4 rounded-lg border border-(--color-border-default) bg-white px-5 py-4 text-left transition-colors hover:border-(--color-primary) hover:bg-(--color-bg-subtle) sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] sm:items-center"
        >
          <div className="min-w-0">
            <Typography
              element="div"
              category="body"
              proportions="xsStrong"
              className="text-(--color-text-disabled)"
            >
              Тип изменения
            </Typography>
            <Typography
              element="div"
              category="body"
              proportions="sStrong"
              className="mt-1 truncate text-(--color-text-primary)"
            >
              {item.operation_name || item.operation_type || '-'}
            </Typography>
          </div>
          <div className="min-w-0">
            <Typography
              element="div"
              category="body"
              proportions="xsStrong"
              className="text-(--color-text-disabled)"
            >
              Инициатор изменения
            </Typography>
            <Typography
              element="div"
              category="body"
              proportions="sStrong"
              className="mt-1 truncate text-(--color-text-body)"
            >
              {item.initiator_name || '-'}
            </Typography>
          </div>
          <div className="sm:text-right">
            <Typography
              element="div"
              category="body"
              proportions="xsStrong"
              className="text-(--color-text-disabled)"
            >
              Дата изменения
            </Typography>
            <Typography
              element="div"
              category="body"
              proportions="sStrong"
              className="mt-1 block whitespace-nowrap text-(--color-text-secondary)"
            >
              {formatDate(item.created_at, 'ru', { withTime: true })}
            </Typography>
          </div>
        </button>
      ))}
      <StockAssetHistoryDetailsModal
        historyId={selectedHistoryId}
        onClose={() => setSelectedHistoryId(null)}
      />
    </Surface>
  );
};
