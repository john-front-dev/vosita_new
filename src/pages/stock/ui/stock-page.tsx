import { useMemo, useState } from 'react';
import {
  Button,
  OutlineSystemDownload,
  OutlineSystemFilterFromLessToMore,
  Search,
  SegmentedControl,
  snackbar,
  Surface,
  Tag,
} from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import { useAccessibleWarehouses } from '@entities/location';
import { httpClient } from '@shared/api';
import { routes } from '@shared/config';
import { formatDate, getStoredAccesses, getStoredUser, useUrlListState } from '@shared/lib';
import { DataTable, type DataTableProps } from '@shared/ui';

import { getStockRequestConfig, stockDownloadEndpoint } from '../api/stock-api';
import { buildStockListParams } from '../lib/build-stock-list-params';
import { getAppliedStockFilters } from '../lib/stock-filter-tags';
import { stockDefaultFilters, stockFilterKeys } from '../model/stock-filters';
import {
  getAvailableStockTabs,
  getDefaultStockListType,
  isStockListType,
} from '../model/stock-tabs';
import type { StockFilterKey, StockFilters, StockListType, StockRecord } from '../model/types';
import { useStockList } from '../model/use-stock-list';
import { StockFiltersModal } from './stock-filters-modal';

const getStockDetailsPath = (type: StockListType, id: number | string) => {
  const detailsPathMap: Record<StockListType, string> = {
    'fixed-assets': routes.fixedAssetsDetails,
    lri: routes.lriDetails,
  };

  return detailsPathMap[type].replace(':id', String(id));
};

const getStatusLabel = (statusId?: number) => {
  const statusMap: Record<number, string> = {
    1: 'Новый',
    2: 'На складе',
    3: 'В эксплуатации',
    4: 'Смешанный',
    8: 'Списан',
    19: 'В ожидании принятия',
  };

  return statusId ? (statusMap[statusId] ?? `Статус ${statusId}`) : '-';
};

export const StockPage = () => {
  const navigate = useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const user = getStoredUser();
  const accesses = getStoredAccesses();
  const accessibleWarehouses = useAccessibleWarehouses();
  const availableTabs = getAvailableStockTabs(user, accesses);
  const defaultType = getDefaultStockListType(user, accesses);
  const {
    clearFilters,
    filters,
    pagination,
    queryParams,
    searchText,
    setFilter,
    setFilters,
    setSearchText,
    setType,
    type,
  } = useUrlListState<StockListType, StockFilterKey>({
    clearOnTypeChange: true,
    defaultType,
    filterKeys: stockFilterKeys,
    isType: isStockListType,
  });

  const stockFilters = useMemo(
    () =>
      (Object.keys(stockDefaultFilters) as StockFilterKey[]).reduce<StockFilters>(
        (accumulator, key) => {
          accumulator[key] = filters[key] ?? [];

          return accumulator;
        },
        { ...stockDefaultFilters },
      ),
    [filters],
  );

  const appliedFilters = useMemo(
    () => getAppliedStockFilters(stockFilters, accessibleWarehouses.warehouses),
    [accessibleWarehouses.warehouses, stockFilters],
  );

  const stockList = useStockList({
    filters: stockFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
    type,
  });

  const handleDownload = async () => {
    const params = buildStockListParams({
      filters: stockFilters,
      limit: queryParams.limit,
      page: queryParams.page,
      searchText: queryParams.searchText,
      type,
    });

    try {
      setIsDownloading(true);

      const response = await httpClient.get<Blob>(stockDownloadEndpoint, {
        ...getStockRequestConfig(params),
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', `stock-${type}.xlsx`);
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      snackbar.show({
        title: 'Не удалось скачать файл',
        type: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const columns = useMemo<DataTableProps<StockRecord>['columns']>(() => {
    const sharedColumns: DataTableProps<StockRecord>['columns'] = [
      {
        accessor: 'name',
        minWidth: '260px',
        title: 'Наименование объекта',
      },
      {
        accessor: 'responsible_person',
        minWidth: '180px',
        renderRowCell: (record) => record.responsible_person || '-',
        title: 'Ответственное лицо',
      },
      {
        accessor: 'city',
        minWidth: '140px',
        renderRowCell: (record) => record.city || '-',
        title: 'Город',
      },
      {
        accessor: 'building',
        minWidth: '160px',
        renderRowCell: (record) => record.building || '-',
        title: 'Здание',
      },
      {
        accessor: 'status_id',
        minWidth: '140px',
        renderRowCell: (record) => getStatusLabel(record.status_id),
        title: 'Статус',
      },
      {
        accessor: 'date',
        minWidth: '140px',
        renderRowCell: (record) => formatDate(record.date),
        title: 'Дата',
      },
    ];

    if (type === 'lri') {
      return sharedColumns;
    }

    return [
      {
        accessor: 'inventory_number',
        maxWidth: '150px',
        renderRowCell: (record) => record.inventory_number || '-',
        title: 'Инвентарный номер',
      },
      ...sharedColumns,
    ];
  }, [type]);

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#101828]">Склад</h1>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline-neutral"
            size="m"
            leftSection={<OutlineSystemDownload />}
            onClick={handleDownload}
            isLoading={isDownloading}
          >
            Скачать
          </Button>

          <SegmentedControl
            tabs={availableTabs.map((tab) => ({
              label: tab.label,
              value: tab.value,
            }))}
            value={type}
            onChange={setType}
            rounded
            size="m"
            variant="accent"
          />
        </div>
      </div>

      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 gap-3">
            <Search
              className="min-w-70 flex-1"
              label="Поиск"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onClear={() => setSearchText('')}
              fullWidth
              proportions="l"
            />
            <Button
              type="button"
              variant="outline-neutral"
              size="l"
              leftSection={<OutlineSystemFilterFromLessToMore />}
              onClick={() => setIsFiltersOpen(true)}
            >
              Фильтр
            </Button>
          </div>
        </div>

        {appliedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {appliedFilters.map((filter) => (
              <Tag
                key={`${filter.key}-${filter.id}`}
                variant="secondary"
                size="s"
                onClose={() => setFilter(filter.key, [])}
              >
                {filter.label}
              </Tag>
            ))}
            <Button type="button" variant="tertiary" size="s" onClick={clearFilters}>
              Сбросить
            </Button>
          </div>
        )}

        <DataTable
          columns={columns}
          records={stockList.records}
          isFetching={stockList.isFetching}
          isLoading={stockList.isLoading}
          onRowClick={(record) => navigate(getStockDetailsPath(type, record.id))}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Пока на складе нет данных.'
          }
          pagination={{
            ...pagination,
            totalCount: stockList.totalCount,
          }}
        />
      </Surface>

      {isFiltersOpen && (
        <StockFiltersModal
          filters={stockFilters}
          isLoading={accessibleWarehouses.isLoading}
          isOpen={isFiltersOpen}
          warehouses={accessibleWarehouses.warehouses}
          onApply={setFilters}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}
    </section>
  );
};
