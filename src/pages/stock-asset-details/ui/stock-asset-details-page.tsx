import { useMemo, useState } from 'react';
import {
  Button,
  Loader,
  OutlineNavigationLeftArrow,
  Surface,
  TabMenuNew,
  Typography,
} from 'alif-ui';
import { useNavigate, useParams } from 'react-router-dom';

import { StockAssetActions } from '@features/stock-asset-actions';
import { StockAssetCapitalization } from '@features/stock-asset-capitalization';
import { StockAssetComments } from '@features/stock-asset-comments';
import { StockAssetHistory } from '@features/stock-asset-history';
import {
  getStockAssetStatusPresentation,
  isOsLikeStockAssetType,
  type StockAssetType,
  useStockAsset,
  useStockAssetComments,
} from '@entities/stock-asset';
import { EmptyPage, StatusBanner } from '@shared/ui';

import type { StockAssetDetailsTab } from '../model/types';
import { StockAssetDescription } from './stock-asset-description';

type StockAssetDetailsPageProps = { type: StockAssetType };

export const StockAssetDetailsPage = ({ type }: StockAssetDetailsPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<StockAssetDetailsTab>('description');
  const isOsLike = isOsLikeStockAssetType(type);
  const { asset, isError, isLoading } = useStockAsset(id);
  const { comments } = useStockAssetComments(id, isOsLike);
  const tabs = useMemo(
    () => [
      { label: 'Описание', value: 'description' },
      { label: 'История событий', value: 'history' },
      {
        counter: asset?.capitalization?.length ?? 0,
        label: 'Капитализация',
        value: 'capitalization',
      },
      ...(isOsLike
        ? [
            {
              counter: comments.length,
              label: 'Комментарии',
              value: 'comments',
            },
          ]
        : []),
    ],
    [asset?.capitalization?.length, comments.length, isOsLike],
  );

  if (isLoading)
    return (
      <section className="min-h-[calc(100vh-48px)]">
        <Surface className="flex justify-center" p="6" rounded="12">
          <Loader />
        </Surface>
      </section>
    );
  if (isError || !asset || !id) return <EmptyPage title="Объект не найден" />;

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
          <StatusBanner label={status.label} tone={status.color} />
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
          {tab === 'comments' && isOsLike && <StockAssetComments assetId={id} />}
        </main>
        <aside className="flex h-fit flex-col gap-4 xl:sticky xl:top-6">
          <StockAssetActions asset={asset} type={type} />
        </aside>
      </div>
    </section>
  );
};
