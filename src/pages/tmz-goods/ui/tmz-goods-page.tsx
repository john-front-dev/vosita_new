import { useMemo } from 'react';
import { Button, OutlineNavigationLeftArrow, Search, Surface, Typography } from 'alif-ui';
import { useNavigate, useParams } from 'react-router-dom';

import { TmzCartDrawer } from '@features/tmz-good-actions';
import { useTmzCategoryOptions } from '@entities/category';
import { isLowStock } from '@entities/tmz-good';
import { routes } from '@shared/config';
import { formatMoney, getStoredUser, useUrlListState } from '@shared/lib';
import { DataTable, type DataTableProps } from '@shared/ui';

import type { TmzGood } from '../model/types';
import { useTmzGoods } from '../model/use-tmz-goods';

export const TmzGoodsPage = () => {
  const navigate = useNavigate();
  const { catId: categoryIdParam, storageId: storageIdParam } = useParams();
  const categoryId = Number(categoryIdParam) || 0;
  const storageId = Number(storageIdParam) || 0;
  const isWarehouseManager = Boolean(getStoredUser()?.is_warehouse_manager);
  const { pagination, queryParams, searchText, setSearchText } = useUrlListState();
  const { categories } = useTmzCategoryOptions(Boolean(categoryId));
  const categoryName =
    categories.find((category) => Number(category.id) === categoryId)?.name ?? '';
  const { goods, isFetching, isLoading, totalCount, totalQuantity } = useTmzGoods({
    categoryId,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
    storageId,
  });
  const columns = useMemo<DataTableProps<TmzGood>['columns']>(
    () => [
      { accessor: 'goods_id', maxWidth: '90px', minWidth: '90px', title: 'ID' },
      {
        accessor: 'goods_name',
        minWidth: '280px',
        renderRowCell: (record) => (
          <span className="flex items-center gap-2">
            {record.goods_name}
            {isLowStock(Number(record.total_qty), record.item_type_name) && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600"
                title="Критически низкий остаток"
                aria-label="Критически низкий остаток"
              />
            )}
          </span>
        ),
        title: 'Название',
      },
      {
        accessor: 'total_qty',
        minWidth: '190px',
        renderRowCell: (record) =>
          `${Number(record.total_qty).toLocaleString('ru-RU')} ${record.unit}`,
        title: 'Количество (остаток)',
      },
      {
        accessor: 'price',
        minWidth: '160px',
        renderRowCell: (record) => formatMoney(Number(record.price) || 0, { currency: 'TJS' }),
        title: 'Цена за единицу',
      },
      {
        accessor: 'total_price',
        minWidth: '210px',
        renderRowCell: (record) =>
          formatMoney(Number(record.total_price) || 0, { currency: 'TJS' }),
        title: 'Общая сумма остатков',
      },
    ],
    [],
  );

  const handleRowClick = (good: TmzGood) => {
    navigate(
      routes.inventoryGoodsDetails
        .replace(':storageId', String(storageId))
        .replace(':catId', String(categoryId))
        .replace(':goodId', String(good.goods_id)),
    );
  };

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
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
        <div className="min-w-0 flex-1">
          <Typography
            element="div"
            role="heading"
            aria-level={1}
            category="heading"
            proportions="h3"
          >
            {categoryName ? `Партии «${categoryName}»` : 'Товары ТМЗ'}
          </Typography>
          <Typography
            element="div"
            category="body"
            proportions="s"
            className="mt-1 text-(--color-text-secondary)"
          >
            Общее количество остатков: {totalQuantity.toLocaleString('ru-RU')} шт
          </Typography>
        </div>
        {isWarehouseManager && <TmzCartDrawer />}
      </div>

      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <Search
          className="min-w-70"
          label="Поиск"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onClear={() => setSearchText('')}
          fullWidth
          proportions="l"
        />

        <DataTable
          accessorId="goods_id"
          columns={columns}
          records={goods}
          isFetching={isFetching}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску «${queryParams.searchText}» ничего не найдено.`
              : 'Список товаров ТМЗ пока пуст.'
          }
          pagination={{ ...pagination, totalCount }}
          tableClassNames={{
            row: (record) =>
              isLowStock(Number(record.total_qty), record.item_type_name) ? 'bg-red-50/70' : '',
          }}
        />
      </Surface>
    </section>
  );
};
