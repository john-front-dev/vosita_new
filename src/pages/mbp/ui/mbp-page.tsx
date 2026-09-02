import { useMemo, useState } from 'react';
import { Badge, Search, Surface, Typography } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import { getMbpStatusPresentation, type MbpRecord } from '@entities/mbp';
import { routes } from '@shared/config';
import { formatDate, useUrlListState } from '@shared/lib';
import { AppliedFilterTags, DataTable, type DataTableProps } from '@shared/ui';

import { getAppliedMbpFilters } from '../lib/mbp-filter-utils';
import {
  mbpDefaultFilters,
  type MbpFilterKey,
  mbpFilterKeys,
  type MbpFilters as MbpFiltersValues,
} from '../model/mbp-filters';
import { useMbpFilterOptions } from '../model/use-mbp-filter-options';
import { useMbpList } from '../model/use-mbp-list';
import { MbpExcelUpload } from './mbp-excel-upload';
import { MbpFilters } from './mbp-filters';

export const MbpPage = () => {
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
  } = useUrlListState<string, MbpFilterKey>({ filterKeys: mbpFilterKeys });
  const mbpFilters = useMemo<MbpFiltersValues>(
    () => ({ ...mbpDefaultFilters, ...filters }),
    [filters],
  );
  const filterOptionsQuery = useMbpFilterOptions();
  const appliedFilters = useMemo(
    () => getAppliedMbpFilters(mbpFilters, filterOptionsQuery.records),
    [filterOptionsQuery.records, mbpFilters],
  );
  const mbpList = useMbpList({
    filters: mbpFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });
  const columns = useMemo<DataTableProps<MbpRecord>['columns']>(
    () => [
      {
        accessor: 'name',
        minWidth: '240px',
        renderRowCell: (record) => record.name || '-',
        title: 'Наименование',
      },
      {
        accessor: 'inventory_number',
        minWidth: '180px',
        renderRowCell: (record) => record.inventory_number || '-',
        title: 'Инвентарный номер',
      },
      {
        accessor: 'responsible_name',
        minWidth: '190px',
        renderRowCell: (record) => record.responsible_name || '-',
        title: 'Сотрудник',
      },
      {
        accessor: 'department_name',
        minWidth: '150px',
        renderRowCell: (record) => record.department_name || '-',
        title: 'Город',
      },
      {
        accessor: 'subdivision_name',
        minWidth: '160px',
        renderRowCell: (record) => record.subdivision_name || '-',
        title: 'Здание',
      },
      {
        accessor: 'storage_name',
        minWidth: '150px',
        renderRowCell: (record) => record.storage_name || '-',
        title: 'Склад',
      },
      {
        accessor: 'rooms_name',
        minWidth: '140px',
        renderRowCell: (record) => record.rooms_name || '-',
        title: 'Кабинет',
      },
      {
        accessor: 'updated_at',
        minWidth: '130px',
        renderRowCell: (record) => formatDate(record.updated_at),
        title: 'Дата',
      },
      {
        accessor: 'status_name',
        minWidth: '200px',
        renderRowCell: (record) => (
          <Badge
            className="whitespace-nowrap"
            size="m"
            type="secondary"
            variant={getMbpStatusPresentation(false, record.status_name).badgeVariant}
          >
            {record.status_name || '-'}
          </Badge>
        ),
        title: 'Статус',
      },
    ],
    [],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          МБП
        </Typography>
        <MbpExcelUpload />
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
          <MbpFilters
            filters={mbpFilters}
            isLoading={filterOptionsQuery.isLoading || filterOptionsQuery.isFetching}
            isOpen={isFiltersOpen}
            onClick={() => setIsFiltersOpen(true)}
            onApply={(nextFilters) => {
              setFilters(nextFilters);
              setIsFiltersOpen(false);
            }}
            onClose={() => setIsFiltersOpen(false)}
            records={filterOptionsQuery.records}
          />
        </div>

        <AppliedFilterTags
          filters={appliedFilters}
          getKey={(filter) => filter.key}
          onClear={clearFilters}
          onRemove={(filter) => setFilter(filter.key, [])}
        />

        <DataTable
          columns={columns}
          records={mbpList.records}
          isFetching={mbpList.isFetching}
          isLoading={mbpList.isLoading}
          onRowClick={(record) => navigate(routes.mbpDetails.replace(':id', String(record.id)))}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Список МБП пока пуст.'
          }
          pagination={{ ...pagination, totalCount: mbpList.totalCount }}
        />
      </Surface>
    </section>
  );
};
