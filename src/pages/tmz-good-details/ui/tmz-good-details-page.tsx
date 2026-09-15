import { useMemo, useState } from 'react';
import {
  Button,
  Loader,
  OutlineNavigationLeftArrow,
  OutlineSystemPlus,
  Surface,
  Typography,
} from 'alif-ui';
import { useNavigate, useParams } from 'react-router-dom';

import {
  AddToCartModal,
  TmzCartDrawer,
  TmzGoodActions,
  TmzGoodHistoryDownloadButton,
} from '@features/tmz-good-actions';
import { isLowStock, type TmzGoodRemain, useTmzGood } from '@entities/tmz-good';
import { formatMoney, getStoredUser } from '@shared/lib';
import { DataTable, type DataTableProps, EmptyPage } from '@shared/ui';

import { TmzGoodHistoryTable } from './tmz-good-history-table';

export const TmzGoodDetailsPage = () => {
  const navigate = useNavigate();
  const { goodId, storageId } = useParams();
  const { isError, isFetching, isLoading, remains } = useTmzGood(goodId, storageId);
  const [cartRemain, setCartRemain] = useState<TmzGoodRemain | null>(null);
  const isWarehouseManager = Boolean(getStoredUser()?.is_warehouse_manager);
  const columns = useMemo<DataTableProps<TmzGoodRemain>['columns']>(
    () => [
      { accessor: 'from_department_name', minWidth: '150px', title: 'Город' },
      { accessor: 'from_subdivision_name', minWidth: '170px', title: 'Здание' },
      { accessor: 'from_storage_name', minWidth: '150px', title: 'Склад' },
      {
        accessor: 'total_qty',
        minWidth: '140px',
        title: 'Общий остаток',
        renderRowCell: (remain) =>
          `${Number(remain.total_qty).toLocaleString('ru-RU')} ${remain.unit}`,
      },
      {
        accessor: 'total_price',
        minWidth: '160px',
        title: 'Сумма остатка',
        renderRowCell: (remain) =>
          formatMoney(Number(remain.total_price) || 0, { currency: 'TJS' }),
      },
      { accessor: 'date', minWidth: '130px', title: 'Дата' },
      {
        accessor: 'actions',
        minWidth: '130px',
        textAlign: 'center',
        title: 'Действия',
        renderRowCell: (remain) => (
          <div className="flex justify-center gap-2" onClick={(event) => event.stopPropagation()}>
            {isWarehouseManager && (
              <Button
                type="button"
                size="s"
                variant="outline-neutral"
                isIconBtn
                title="Добавить в корзину"
                disabled={!remain.total_qty}
                onClick={() => setCartRemain(remain)}
              >
                <OutlineSystemPlus />
              </Button>
            )}
            <TmzGoodHistoryDownloadButton
              goodsId={remain.goods_id}
              storageId={remain.from_storage}
            />
          </div>
        ),
      },
    ],
    [isWarehouseManager],
  );

  if (isLoading) {
    return (
      <Surface className="flex justify-center" p="6" rounded="12">
        <Loader />
      </Surface>
    );
  }
  if (isError || !goodId || !storageId) return <EmptyPage title="Товар не найден" />;

  const firstRemain = remains[0];
  const totalQuantity = remains.reduce((total, remain) => total + Number(remain.total_qty || 0), 0);
  const hasLowStock = isLowStock(totalQuantity, firstRemain?.item_type_name);

  return (
    <section className="flex flex-1 flex-col gap-5 pb-10">
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
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Typography element="div" category="heading" proportions="h3" className="truncate">
              {firstRemain?.name ?? 'Товар'}
            </Typography>
            {hasLowStock && (
              <span
                className="h-3 w-3 shrink-0 rounded-full bg-red-600"
                title="Критически низкий остаток"
                aria-label="Критически низкий остаток"
              />
            )}
          </div>
          <Typography
            element="div"
            category="body"
            proportions="s"
            className="mt-1 text-(--color-text-secondary)"
          >
            Общее количество остатков: {totalQuantity.toLocaleString('ru-RU')}{' '}
            {firstRemain?.unit ?? 'шт'}
          </Typography>
        </div>
        {isWarehouseManager && <TmzCartDrawer />}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
        <Surface p="6" rounded="12">
          <DataTable
            accessorId="id"
            columns={columns}
            records={remains}
            emptyPlaceholder="Остатков товара нет"
            isFetching={isFetching}
            isMultiExpanded
            rowSpacing="m"
            rowExpansion={{
              content: () => (
                <div className="w-full min-w-0 contain-[inline-size]">
                  <TmzGoodHistoryTable goodsId={goodId} storageId={storageId} />
                </div>
              ),
            }}
          />
        </Surface>
        <aside className="h-fit xl:sticky xl:top-6">
          <Surface p="4" rounded="12">
            <TmzGoodActions
              goodsId={Number(goodId)}
              remains={remains}
              storageId={Number(storageId)}
            />
          </Surface>
        </aside>
      </div>

      {cartRemain && (
        <AddToCartModal isOpen onClose={() => setCartRemain(null)} remain={cartRemain} />
      )}
    </section>
  );
};
