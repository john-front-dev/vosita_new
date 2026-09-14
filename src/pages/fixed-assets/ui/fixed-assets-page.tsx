import { useMemo, useState } from 'react';
import { Badge, Search, Surface, Typography } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import { useCategories } from '@entities/category';
import { useBuildings, useCabinets, useCities } from '@entities/location';
import {
  getStockAssetStatusBadgeVariant,
  getStockAssetStatusLabel,
  type StockAssetListItem,
} from '@entities/stock-asset';
import { routes } from '@shared/config';
import { formatDate, formatMoney, useUrlListState } from '@shared/lib';
import { AppliedFilterTags, DataTable, type DataTableProps } from '@shared/ui';

import { getAppliedFixedAssetsFilters } from '../lib/fixed-assets-filter-tags';
import { fixedAssetsDefaultFilters } from '../model/fixed-assets-filters';
import { useFixedAssetsList } from '../model/use-fixed-assets-list';
import { FixedAssetsDownloadButton } from './fixed-assets-download-button';
import { FixedAssetsFilters } from './fixed-assets-filters';
import {
  FixedAssetsInventoryActions,
  FixedAssetsInventoryButton,
} from './fixed-assets-inventory-action';
import { FixedAssetsUploadButton } from './fixed-assets-upload-button';

export const FixedAssetsPage = () => {
  const navigate = useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<number[]>([]);
  const {
    clearFilters,
    filters,
    pagination,
    queryParams,
    searchText,
    setFilter,
    setFilters,
    setSearchText,
  } = useUrlListState({ filterKeys: Object.keys(fixedAssetsDefaultFilters) });
  const fixedAssetsFilters = useMemo(
    () => ({ ...fixedAssetsDefaultFilters, ...filters }),
    [filters],
  );
  const { cities } = useCities('', Boolean(fixedAssetsFilters.CITY_ID[0]));
  const { categories } = useCategories('', Boolean(fixedAssetsFilters.CATEGORY_ID[0]));
  const { buildings } = useBuildings(
    fixedAssetsFilters.CITY_ID[0],
    '',
    Boolean(fixedAssetsFilters.BUILDING_ID[0]),
  );
  const { cabinets } = useCabinets(
    fixedAssetsFilters.BUILDING_ID[0],
    '',
    Boolean(fixedAssetsFilters.CABINET_ID[0]),
  );
  const appliedFilters = useMemo(
    () => getAppliedFixedAssetsFilters(fixedAssetsFilters, cities, buildings, cabinets, categories),
    [buildings, cabinets, categories, cities, fixedAssetsFilters],
  );
  const stockList = useFixedAssetsList({
    filters: fixedAssetsFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });

  const handleInventoryRowClick = (record: StockAssetListItem) => {
    setSelectedInventoryIds((currentIds) =>
      currentIds.includes(Number(record.id))
        ? currentIds.filter((selectedId) => selectedId !== Number(record.id))
        : [...currentIds, Number(record.id)],
    );
  };

  const columns = useMemo<DataTableProps<StockAssetListItem>['columns']>(
    () => [
      {
        accessor: 'inventory_number',
        minWidth: '200px',
        renderRowCell: (record) => record.inventory_number || '-',
        title: 'Инвентарный номер',
      },
      { accessor: 'name', minWidth: '260px', title: 'Наименование объекта' },
      {
        accessor: 'responsible_person',
        minWidth: '190px',
        renderRowCell: (record) => record.responsible_person || '-',
        title: 'Ответственное лицо',
      },
      {
        accessor: 'building',
        minWidth: '160px',
        renderRowCell: (record) => record.building || '-',
        title: 'Здание',
      },
      {
        accessor: 'cabinet',
        minWidth: '140px',
        renderRowCell: (record) => record.cabinet || '-',
        title: 'Кабинет',
      },
      {
        accessor: 'price',
        minWidth: '140px',
        renderRowCell: (record) =>
          record.price === undefined
            ? '-'
            : formatMoney(record.price, { currency: record.currency }),
        title: 'Стоимость',
      },
      {
        accessor: 'status_id',
        minWidth: '210px',
        renderRowCell: (record) => (
          <Badge
            size="m"
            type="secondary"
            variant={getStockAssetStatusBadgeVariant(record.status_id)}
            className="whitespace-nowrap"
          >
            {getStockAssetStatusLabel(record.status_id)}
          </Badge>
        ),
        title: 'Статус',
      },
      {
        accessor: 'date',
        minWidth: '130px',
        renderRowCell: (record) => (record.date ? formatDate(record.date) : '-'),
        title: 'Дата',
      },
      {
        accessor: 'is_inventoried',
        maxWidth: '72px',
        minWidth: '72px',
        renderRowCell: (record) =>
          record.is_inventoried ? (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full bg-(--color-bg-success) text-sm font-semibold text-(--color-text-inverse)"
              title="Инвентаризирован"
              aria-label="Инвентаризирован"
            >
              ✓
            </div>
          ) : (
            '-'
          ),
        title: '',
      },
    ],
    [],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          ОС
        </Typography>
        <div className="flex items-center gap-3">
          <FixedAssetsInventoryButton
            isActive={isInventoryMode}
            onClick={() => {
              setIsInventoryMode((previousValue) => !previousValue);
              setSelectedInventoryIds([]);
            }}
          />
          <FixedAssetsUploadButton />
          <FixedAssetsDownloadButton
            filters={fixedAssetsFilters}
            page={queryParams.page}
            limit={queryParams.limit}
            searchText={queryParams.searchText}
          />
        </div>
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
          <FixedAssetsFilters
            onClick={() => setIsFiltersOpen(true)}
            filters={fixedAssetsFilters}
            isOpen={isFiltersOpen}
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
          onRemove={(filter) => setFilter(filter.key, [])}
        />

        {isInventoryMode && (
          <FixedAssetsInventoryActions
            records={stockList.records}
            selectedIds={selectedInventoryIds}
            onCancel={() => {
              setIsInventoryMode(false);
              setSelectedInventoryIds([]);
            }}
          />
        )}

        <DataTable
          columns={columns}
          records={stockList.records}
          isFetching={stockList.isFetching}
          isLoading={stockList.isLoading}
          selectedRecords={isInventoryMode ? selectedInventoryIds : undefined}
          onSelectedRecordsChange={isInventoryMode ? setSelectedInventoryIds : undefined}
          onRowClick={
            isInventoryMode
              ? handleInventoryRowClick
              : (record) => navigate(routes.fixedAssetsDetails.replace(':id', String(record.id)))
          }
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Список ОС пока пуст.'
          }
          pagination={{ ...pagination, totalCount: stockList.totalCount }}
        />
      </Surface>
    </section>
  );
};
