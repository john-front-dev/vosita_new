import { useMemo, useState } from 'react';
import { Badge, Button, Search, Surface, Tag, Typography } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import type { StockRecord } from '@pages/stock/model/types';

import { useBuildings, useCities } from '@entities/location';
import { getStockAssetStatusBadgeVariant, getStockAssetStatusLabel } from '@entities/stock-asset';
import { routes } from '@shared/config';
import { formatDate, formatMoney, useUrlListState } from '@shared/lib';
import { DataTable, type DataTableProps } from '@shared/ui';

import { getAppliedLriFilters } from '../lib/lri-filter-tags';
import {
  lriDefaultFilters,
  type LriFilterKey,
  lriFilterKeys,
  type LriFilters as LriFiltersValues,
} from '../model/lri-filters';
import { useLriList } from '../model/use-lri-list';
import { LriFilters } from './lri-filters';

export const LriPage = () => {
  const navigate = useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const {
    clearFilters,
    filters,
    pagination,
    queryParams,
    searchText,
    setFilter,
    setFilters,
    setSearchText,
  } = useUrlListState<string, LriFilterKey>({ filterKeys: lriFilterKeys });
  const lriFilters = useMemo<LriFiltersValues>(
    () => ({ ...lriDefaultFilters, ...filters }),
    [filters],
  );
  const citiesQuery = useCities('', Boolean(lriFilters.CITY_ID[0]));
  const buildingsQuery = useBuildings(
    lriFilters.CITY_ID[0],
    '',
    Boolean(lriFilters.BUILDING_ID[0]),
  );
  const appliedFilters = useMemo(
    () => getAppliedLriFilters(lriFilters, citiesQuery.cities, buildingsQuery.buildings),
    [buildingsQuery.buildings, citiesQuery.cities, lriFilters],
  );
  const lriList = useLriList({
    filters: lriFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });
  const columns = useMemo<DataTableProps<StockRecord>['columns']>(
    () => [
      { accessor: 'name', minWidth: '260px', title: 'Наименование объекта' },
      {
        accessor: 'responsible_person',
        minWidth: '190px',
        renderRowCell: (record) => record.responsible_person || '-',
        title: 'Ответственное лицо',
      },
      {
        accessor: 'category_name',
        minWidth: '180px',
        renderRowCell: (record) => record.category_name || '-',
        title: 'Категория',
      },
      {
        accessor: 'building',
        minWidth: '160px',
        renderRowCell: (record) => record.building || '-',
        title: 'Здание',
      },
      {
        accessor: 'price',
        minWidth: '140px',
        renderRowCell: (record) => formatMoney(record.price, { currency: record.currency }),
        title: 'Стоимость',
      },
      {
        accessor: 'status_id',
        minWidth: '210px',
        renderRowCell: (record) => (
          <Badge
            className="whitespace-nowrap"
            size="m"
            type="secondary"
            variant={getStockAssetStatusBadgeVariant(record.status_id)}
          >
            {getStockAssetStatusLabel(record.status_id)}
          </Badge>
        ),
        title: 'Статус',
      },
      {
        accessor: 'date',
        minWidth: '130px',
        renderRowCell: (record) => formatDate(record.date),
        title: 'Дата',
      },
    ],
    [],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
        Права аренды и усовершенствования
      </Typography>

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
          <LriFilters
            filters={lriFilters}
            isOpen={isFiltersOpen}
            onClick={() => setIsFiltersOpen(true)}
            onApply={(nextFilters) => {
              setFilters(nextFilters);
              setIsFiltersOpen(false);
            }}
            onClose={() => setIsFiltersOpen(false)}
          />
        </div>

        {appliedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {appliedFilters.map((filter) => (
              <Tag
                key={filter.key}
                variant="primary"
                size="s"
                onClose={() => setFilter(filter.key, [])}
              >
                {filter.label}
              </Tag>
            ))}
            <Button type="button" variant="secondary" size="s" onClick={clearFilters}>
              Сбросить
            </Button>
          </div>
        )}

        <DataTable
          columns={columns}
          records={lriList.records}
          isFetching={lriList.isFetching}
          isLoading={lriList.isLoading}
          onRowClick={(record) => navigate(routes.lriDetails.replace(':id', String(record.id)))}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Список ПАУ пока пуст.'
          }
          pagination={{ ...pagination, totalCount: lriList.totalCount }}
        />
      </Surface>
    </section>
  );
};
