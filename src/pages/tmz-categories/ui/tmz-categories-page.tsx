import { useMemo, useState } from 'react';
import { Search, Surface, Typography } from 'alif-ui';
import { useNavigate, useParams } from 'react-router-dom';

import { TmzCartDrawer } from '@features/tmz-good-actions';
import { useTmzCategoryOptions } from '@entities/category';
import { useBuildings, useCities } from '@entities/location';
import { isLowStock } from '@entities/tmz-good';
import { routes } from '@shared/config';
import { formatMoney, getStoredUser, useUrlListState } from '@shared/lib';
import { AppliedFilterTags, DataTable, type DataTableProps } from '@shared/ui';

import {
  tmzCategoriesDefaultFilters,
  type TmzCategoriesFilterKey,
} from '../model/tmz-categories-filters';
import type { TmzCategoryRow } from '../model/types';
import { useTmzCategories } from '../model/use-tmz-categories';
import { TmzCategoriesFilters } from './tmz-categories-filters';

export const TmzCategoriesPage = () => {
  const navigate = useNavigate();
  const { storageId: storageIdParam } = useParams();
  const storageId = Number(storageIdParam) || 0;
  const isWarehouseManager = Boolean(getStoredUser()?.is_warehouse_manager);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const {
    clearFilters,
    filters: urlFilters,
    pagination,
    queryParams,
    searchText,
    setFilter,
    setFilters,
    setSearchText,
  } = useUrlListState<string, TmzCategoriesFilterKey>({
    filterKeys: Object.keys(tmzCategoriesDefaultFilters) as TmzCategoriesFilterKey[],
  });
  const filters = { ...tmzCategoriesDefaultFilters, ...urlFilters };
  const { cities } = useCities('', Boolean(filters.CITY_ID[0]));
  const { buildings } = useBuildings(filters.CITY_ID[0], '', Boolean(filters.BUILDING_ID[0]));
  const { categories: filterCategories } = useTmzCategoryOptions(Boolean(filters.CATEGORY_ID[0]));
  const { isFetching, isLoading, isSearching, rows, totalCount, totalSum } = useTmzCategories({
    filters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
    storageId,
  });
  const appliedFilters = useMemo(
    () =>
      [
        filters.CITY_ID[0] && {
          key: 'CITY_ID' as const,
          label:
            cities.find((city) => String(city.id) === filters.CITY_ID[0])?.name ??
            filters.CITY_ID[0],
        },
        filters.BUILDING_ID[0] && {
          key: 'BUILDING_ID' as const,
          label:
            buildings.find((building) => String(building.id) === filters.BUILDING_ID[0])?.name ??
            buildings.find((building) => String(building.id) === filters.BUILDING_ID[0])?.build ??
            filters.BUILDING_ID[0],
        },
        filters.CATEGORY_ID[0] && {
          key: 'CATEGORY_ID' as const,
          label:
            filterCategories.find((category) => String(category.id) === filters.CATEGORY_ID[0])
              ?.name ?? filters.CATEGORY_ID[0],
        },
        filters.WITH_ZEROS[0] === 'true' && {
          key: 'WITH_ZEROS' as const,
          label: 'С нулевыми остатками',
        },
      ].filter((filter): filter is { key: TmzCategoriesFilterKey; label: string } =>
        Boolean(filter),
      ),
    [
      buildings,
      cities,
      filterCategories,
      filters.BUILDING_ID,
      filters.CATEGORY_ID,
      filters.CITY_ID,
      filters.WITH_ZEROS,
    ],
  );
  const columns = useMemo<DataTableProps<TmzCategoryRow>['columns']>(
    () => [
      { accessor: 'displayId', maxWidth: '90px', minWidth: '90px', title: 'ID' },
      {
        accessor: 'name',
        minWidth: '280px',
        renderRowCell: (record) => (
          <div className={record.kind === 'good' ? 'pl-6' : undefined}>
            {record.kind === 'good' && (
              <span className="mr-2 text-(--color-text-disabled)">Товар</span>
            )}
            {record.name}
            {record.kind === 'good' && isLowStock(record.totalQty) && (
              <span
                className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-red-600"
                title="Критически низкий остаток"
                aria-label="Критически низкий остаток"
              />
            )}
          </div>
        ),
        title: 'Название',
      },
      {
        accessor: 'totalQty',
        minWidth: '150px',
        renderRowCell: (record) =>
          `${record.totalQty.toLocaleString('ru-RU')}${record.unit ? ` ${record.unit}` : ''}`,
        title: 'Общее кол-во',
      },
      {
        accessor: 'price',
        minWidth: '140px',
        renderRowCell: (record) =>
          record.price === undefined ? '-' : formatMoney(record.price, { currency: 'TJS' }),
        title: 'Цена',
      },
      {
        accessor: 'totalPrice',
        minWidth: '170px',
        renderRowCell: (record) => formatMoney(record.totalPrice, { currency: 'TJS' }),
        title: 'Общая цена',
      },
    ],
    [],
  );

  const handleRowClick = (record: TmzCategoryRow) => {
    const categoryPath = routes.inventoryGoods
      .replace(':storageId', String(record.storageId))
      .replace(':catId', String(record.categoryId));

    if (record.goodId) {
      navigate(
        routes.inventoryGoodsDetails
          .replace(':storageId', String(record.storageId))
          .replace(':catId', String(record.categoryId))
          .replace(':goodId', String(record.goodId)),
      );
      return;
    }

    navigate(categoryPath);
  };

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Typography
            element="div"
            role="heading"
            aria-level={1}
            category="heading"
            proportions="h3"
          >
            Категории TMZ
          </Typography>
          <Typography
            element="div"
            category="body"
            proportions="s"
            className="mt-1 text-(--color-text-secondary)"
          >
            Общая сумма остатков: {totalSum.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}{' '}
            сомони
          </Typography>
        </div>
        {isWarehouseManager && <TmzCartDrawer />}
      </div>

      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <div className="flex min-w-0 gap-3">
          <Search
            className="min-w-70 flex-1"
            label="Поиск"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onClear={() => setSearchText('')}
            fullWidth
            proportions="l"
          />
          <TmzCategoriesFilters
            filters={filters}
            isOpen={isFiltersOpen}
            onClick={() => setIsFiltersOpen(true)}
            onApply={(nextFilters) => {
              setFilters(nextFilters);
              setIsFiltersOpen(false);
            }}
            onClose={() => setIsFiltersOpen(false)}
          />
        </div>

        <AppliedFilterTags
          filters={appliedFilters}
          getKey={(filter) => filter.key}
          onClear={clearFilters}
          onRemove={(filter) => {
            if (filter.key === 'CITY_ID') {
              setFilters({ ...filters, BUILDING_ID: [], CITY_ID: [] });
              return;
            }

            setFilter(filter.key, []);
          }}
        />

        <DataTable
          columns={columns}
          records={rows}
          isFetching={isFetching}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          emptyPlaceholder={
            isSearching
              ? `По поиску «${queryParams.searchText}» ничего не найдено.`
              : storageId
                ? 'Список категорий ТМЗ пока пуст.'
                : 'Выберите склад ТМЗ в боковом меню.'
          }
          pagination={isSearching ? undefined : { ...pagination, totalCount }}
          tableClassNames={{
            row: (record) =>
              record.kind === 'good' && isLowStock(record.totalQty) ? 'bg-red-50/70' : '',
          }}
        />
      </Surface>
    </section>
  );
};
