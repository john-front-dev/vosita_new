import { useState } from 'react';
import { Button, OutlineNavigationLeftArrow, Surface, TabMenuNew, Typography } from 'alif-ui';
import { useNavigate, useParams } from 'react-router-dom';

import { MbpActions } from '@features/mbp-actions';
import { StockAssetComments } from '@features/stock-asset-comments';
import { StockAssetHistory } from '@features/stock-asset-history';
import { getMbpStatusPresentation, useMbpDetails } from '@entities/mbp';
import { useStockAssetComments, useStockAssetHistory } from '@entities/stock-asset';
import { EmptyPage, StatusBanner } from '@shared/ui';

import { MbpDetailsDescription } from './mbp-details-description';

type MbpDetailsTab = 'comments' | 'description' | 'history';

export const MbpDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<MbpDetailsTab>('description');
  const { mbp, isLoading, isError } = useMbpDetails(id);
  const commentsQuery = useStockAssetComments(id, Boolean(id), 'mbp');
  const historyQuery = useStockAssetHistory(id, Boolean(id), 'mbp');

  if (isLoading)
    return (
      <section className="min-h-[calc(100vh-48px)]">
        <Surface p="6" rounded="12">
          <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
            Загрузка МБП…
          </Typography>
        </Surface>
      </section>
    );

  if (isError || !mbp || !id) return <EmptyPage title="МБП не найден" />;
  const status = getMbpStatusPresentation(mbp.is_repair, mbp.status_name);

  const tabs = [
    { label: 'Описание', value: 'description' },
    {
      ...(historyQuery.totalCount > 0 ? { counter: historyQuery.totalCount } : {}),
      label: 'История событий',
      value: 'history',
    },
    {
      ...(commentsQuery.comments.length > 0 ? { counter: commentsQuery.comments.length } : {}),
      label: 'Комментарии',
      value: 'comments',
    },
  ];

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5 pb-10">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline-neutral"
          size="s"
          isIconBtn
          onClick={() => navigate(-1)}
        >
          <OutlineNavigationLeftArrow />
        </Button>
        <Typography
          element="div"
          category="heading"
          proportions="h3"
          className="min-w-0 truncate text-(--color-text-primary)"
        >
          {mbp.name}
        </Typography>
      </div>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_280px] gap-6">
        <main className="mx-auto flex w-full max-w-160 min-w-0 flex-col gap-5">
          <StatusBanner label={status.label} tone={status.tone} />
          <TabMenuNew
            tabs={tabs}
            value={tab}
            justify="center"
            onChange={(value) => setTab(value as MbpDetailsTab)}
          />
          {tab === 'description' && <MbpDetailsDescription mbp={mbp} />}
          {tab === 'history' && <StockAssetHistory assetId={id} resource="mbp" />}
          {tab === 'comments' && <StockAssetComments assetId={id} resource="mbp" />}
        </main>
        <aside className="h-fit">
          <MbpActions mbp={mbp} />
        </aside>
      </div>
    </section>
  );
};
