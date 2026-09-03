import { useMemo, useState } from 'react';
import { Surface, Typography } from 'alif-ui';

import { StockAssetHistoryDetailsModal } from '@features/stock-asset-history';
import { useEmployees } from '@entities/employee';
import { getStorageId, getStorageName, useAllWarehouses } from '@entities/location';
import { formatDate, useUrlListState } from '@shared/lib';
import { AppliedFilterTags, DataTable, type DataTableProps } from '@shared/ui';

import { historyOperationOptions } from '../model/history-options';
import {
  type HistoryFilterKey,
  historyFilterKeys,
  type HistoryFilters as HistoryFilterValues,
  type HistoryRecord,
} from '../model/types';
import { useHistoryList } from '../model/use-history-list';
import { HistoryDetailsModal } from './history-details-modal';
import { HistoryFilters } from './history-filters';

type SelectedHistory = Pick<HistoryRecord, 'id' | 'type'>;

const isFixedAssetOperation = (operationType?: string) =>
  Boolean(operationType && /(?:ОС|OC)/i.test(operationType));

export const HistoryPage = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<SelectedHistory | null>(null);
  const { clearFilters, filters, pagination, queryParams, setFilter, setFilters } = useUrlListState<
    string,
    HistoryFilterKey
  >({ filterKeys: historyFilterKeys });
  const historyFilters = filters as HistoryFilterValues;
  const list = useHistoryList({
    filters: historyFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });
  const warehousesQuery = useAllWarehouses(true);
  const employeesQuery = useEmployees();

  const appliedFilters = useMemo(() => {
    const warehouseId = historyFilters.warehouse_id[0];
    const operationId = historyFilters.operation_type[0];
    const initiatorId = historyFilters.initiator[0];
    const warehouse = warehousesQuery.warehouses.find(
      (item) => String(getStorageId(item)) === warehouseId,
    );
    const operation = historyOperationOptions.find((item) => item.value === operationId);
    const initiator = employeesQuery.employees.find((item) => String(item.id) === initiatorId);

    return [
      warehouseId && {
        key: 'warehouse_id' as const,
        label: `Склад: ${warehouse ? getStorageName(warehouse) : warehouseId}`,
      },
      operationId && {
        key: 'operation_type' as const,
        label: `Тип: ${operation?.label ?? operationId}`,
      },
      initiatorId && {
        key: 'initiator' as const,
        label: `Инициатор: ${initiator?.full_name ?? initiatorId}`,
      },
      historyFilters.start_date[0] && {
        key: 'start_date' as const,
        label: `От: ${historyFilters.start_date[0]}`,
      },
      historyFilters.end_date[0] && {
        key: 'end_date' as const,
        label: `До: ${historyFilters.end_date[0]}`,
      },
    ].filter(Boolean) as Array<{ key: HistoryFilterKey; label: string }>;
  }, [employeesQuery.employees, historyFilters, warehousesQuery.warehouses]);

  const columns = useMemo<DataTableProps<HistoryRecord>['columns']>(
    () => [
      { accessor: 'id', maxWidth: '100px', minWidth: '80px', title: 'ID' },
      {
        accessor: 'initiator',
        minWidth: '240px',
        renderRowCell: (record) => record.initiator || '-',
        title: 'Инициатор',
      },
      {
        accessor: 'type',
        minWidth: '280px',
        renderRowCell: (record) => record.type || '-',
        title: 'Тип операции',
      },
      {
        accessor: 'date',
        minWidth: '180px',
        renderRowCell: (record) => formatDate(record.date, 'ru', { withTime: true }),
        title: 'Дата',
      },
    ],
    [],
  );
  const closeDetails = () => setSelectedHistory(null);

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          История событий
        </Typography>
        <HistoryFilters
          filters={historyFilters}
          isOpen={isFiltersOpen}
          onClick={() => setIsFiltersOpen(true)}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setIsFiltersOpen(false);
          }}
          onClose={() => setIsFiltersOpen(false)}
        />
      </div>
      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <AppliedFilterTags
          filters={appliedFilters}
          getKey={(filter) => filter.key}
          onClear={clearFilters}
          onRemove={(filter) => setFilter(filter.key, [])}
        />
        <DataTable
          columns={columns}
          records={list.records}
          isFetching={list.isFetching}
          isLoading={list.isLoading}
          onRowClick={(record) => setSelectedHistory({ id: record.id, type: record.type })}
          emptyPlaceholder="История событий пока пуста."
          pagination={{ ...pagination, totalCount: list.totalCount }}
        />
      </Surface>
      {selectedHistory && isFixedAssetOperation(selectedHistory.type) ? (
        <StockAssetHistoryDetailsModal historyId={selectedHistory.id} onClose={closeDetails} />
      ) : (
        <HistoryDetailsModal historyId={selectedHistory?.id ?? null} onClose={closeDetails} />
      )}
    </section>
  );
};
