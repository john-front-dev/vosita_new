import { useState } from 'react';
import { Pagination, Surface, Typography } from 'alif-ui';

import { type AssetResource, useStockAssetHistory } from '@entities/stock-asset';
import { formatDate } from '@shared/lib';

import { StockAssetHistoryDetailsModal } from './stock-asset-history-details-modal';

export const StockAssetHistory = ({
  assetId,
  resource = 'stock-asset',
}: {
  assetId: string;
  resource?: AssetResource;
}) => {
  const [page, setPage] = useState(1);
  const historyQuery = useStockAssetHistory(assetId, true, resource, page);
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
          className="grid w-full cursor-pointer grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-(--color-border-default) bg-white px-5 py-4 text-left transition-colors hover:border-(--color-primary) hover:bg-(--color-bg-subtle)"
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
          <div className="text-right">
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
      {resource === 'mbp' && historyQuery.totalPages > 1 && (
        <Pagination
          className="mt-3 flex justify-center"
          currentPage={historyQuery.currentPage}
          pageSize={10}
          totalCount={historyQuery.totalCount}
          onPageChange={setPage}
          size="m"
          variant="default"
          rounded
          showFirstLastButton
          showPages
        />
      )}
      <StockAssetHistoryDetailsModal
        historyId={selectedHistoryId}
        onClose={() => setSelectedHistoryId(null)}
      />
    </Surface>
  );
};
