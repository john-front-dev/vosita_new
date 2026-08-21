import { useMemo, useState } from 'react';
import { Button, OutlineNavigationLeftArrow, Surface, TabMenuNew, Typography } from 'alif-ui';
import { useNavigate, useParams } from 'react-router-dom';

import { StockAssetActions } from '@features/stock-asset-actions';
import { StockAssetCapitalization } from '@features/stock-asset-capitalization';
import { StockAssetComments } from '@features/stock-asset-comments';
import { StockAssetHistory } from '@features/stock-asset-history';
import {
  getStockAssetStatusPresentation,
  type StockAssetType,
  useStockAsset,
  useStockAssetComments,
} from '@entities/stock-asset';
import { EmptyPage } from '@shared/ui';

import type { StockAssetDetailsTab } from '../model/types';
import { StockAssetDescription } from './stock-asset-description';

type StockAssetDetailsPageProps = { type: StockAssetType };

const statusClasses = {
  blue: 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)',
  green: 'border-(--color-success) bg-(--color-success-soft) text-(--color-success)',
  grey: 'border-(--color-text-disabled) bg-(--color-border-default) text-(--color-text-disabled)',
  red: 'border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)',
  yellow: 'border-(--color-warning) bg-(--color-warning-soft) text-(--color-warning)',
} as const;

export const StockAssetDetailsPage = ({ type }: StockAssetDetailsPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<StockAssetDetailsTab>('description');
  const assetQuery = useStockAsset(id);
  const commentsQuery = useStockAssetComments(id, type === 'fixed-assets');
  const asset = assetQuery.asset;
  const tabs = useMemo(
    () => [
      { label: 'Описание', value: 'description' },
      { label: 'История событий', value: 'history' },
      {
        counter: asset?.capitalization?.length ?? 0,
        label: 'Капитализация',
        value: 'capitalization',
      },
      ...(type === 'fixed-assets'
        ? [
            {
              counter: commentsQuery.comments.length,
              label: 'Комментарии',
              value: 'comments',
            },
          ]
        : []),
    ],
    [asset?.capitalization?.length, commentsQuery.comments.length, type],
  );

  if (assetQuery.isLoading)
    return (
      <section className="min-h-[calc(100vh-48px)]">
        <Surface p="6" rounded="12">
          <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
            Загрузка объекта…
          </Typography>
        </Surface>
      </section>
    );
  if (assetQuery.isError || !asset || !id) return <EmptyPage title="Объект не найден" />;

  const status = getStockAssetStatusPresentation(asset.is_repair, asset.status_id);
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
          {asset.name}
        </Typography>
      </div>
      <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <main className="mx-auto flex w-full max-w-140 min-w-0 flex-col gap-5 xl:mx-0 xl:justify-self-center">
          <Typography
            element="div"
            category="body"
            proportions="sStrong"
            className={`rounded-lg border-2 px-4 py-2 text-center ${statusClasses[status.color]}`}
          >
            {status.label}
          </Typography>
          <TabMenuNew
            tabs={tabs}
            value={tab}
            justify="center"
            onChange={(value) => setTab(value as StockAssetDetailsTab)}
          />
          {tab === 'description' && <StockAssetDescription asset={asset} type={type} />}
          {tab === 'history' && <StockAssetHistory assetId={id} />}
          {tab === 'capitalization' && (
            <StockAssetCapitalization assetId={id} capitalization={asset.capitalization} />
          )}
          {tab === 'comments' && type === 'fixed-assets' && <StockAssetComments assetId={id} />}
        </main>
        <aside className="flex h-fit flex-col gap-4 xl:sticky xl:top-6">
          <StockAssetActions asset={asset} type={type} />
        </aside>
      </div>
    </section>
  );
};
