import { useState } from 'react';
import { Button, Loader, OutlineNavigationLeftArrow, TabMenuNew, Typography } from 'alif-ui';
import { useNavigate, useParams } from 'react-router-dom';

import { MbpActions } from '@features/mbp-actions';
import { StockAssetComments } from '@features/stock-asset-comments';
import { StockAssetHistory } from '@features/stock-asset-history';
import { getMbpStatusPresentation, useMbpDetails } from '@entities/mbp';
import { useStockAssetComments, useStockAssetHistory } from '@entities/stock-asset';
import { routes } from '@shared/config';
import { StatusBanner } from '@shared/ui';

import { MbpDetailsDescription } from './mbp-details-description';

type MbpDetailsTab = 'comments' | 'description' | 'history';

export const MbpDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<MbpDetailsTab>('description');
  const { mbp, isLoading, isError } = useMbpDetails(id);
  const { comments } = useStockAssetComments(id, Boolean(id), 'mbp');
  const { totalCount: historyCount } = useStockAssetHistory(id, Boolean(id), 'mbp');

  const header = (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline-neutral"
        size="s"
        isIconBtn
        aria-label="Вернуться к списку МБП"
        onClick={() => navigate(routes.mbp)}
      >
        <OutlineNavigationLeftArrow />
      </Button>
      <Typography
        element="div"
        category="heading"
        proportions="h3"
        className="min-w-0 truncate text-(--color-text-primary)"
      >
        {mbp?.name || 'МБП'}
      </Typography>
    </div>
  );

  if (isLoading)
    return (
      <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5 pb-10">
        {header}
        <div className="flex flex-1 items-center justify-center">
          <Loader />
        </div>
      </section>
    );

  if (isError || !mbp || !id)
    return (
      <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5 pb-10">
        {header}
        <div className="flex flex-1 items-center justify-center">
          <Typography element="div" category="heading" proportions="h3">
            МБП не найден
          </Typography>
        </div>
      </section>
    );

  const status = getMbpStatusPresentation(mbp.is_repair, mbp.status_name);

  const tabs = [
    { label: 'Описание', value: 'description' },
    {
      ...(historyCount > 0 ? { counter: historyCount } : {}),
      label: 'История событий',
      value: 'history',
    },
    {
      ...(comments.length > 0 ? { counter: comments.length } : {}),
      label: 'Комментарии',
      value: 'comments',
    },
  ];

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5 pb-10">
      {header}
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
