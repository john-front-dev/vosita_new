import { type SetStateAction, useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  OutlineSystemDownload,
  Search,
  snackbar,
  Surface,
  Typography,
} from 'alif-ui';

import { useAllWarehouses } from '@entities/location';
import { httpClient } from '@shared/api';
import { downloadBlob, formatDate, useUrlListState } from '@shared/lib';
import { AppliedFilterTags, DataTable, type DataTableProps } from '@shared/ui';

import { approvalEndpoints } from '../api/approval-api';
import {
  formatApprovalLocation,
  formatApprovalQuantity,
  getAppliedApprovalFilters,
  getApprovalStatusVariant,
} from '../lib/approval-utils';
import {
  type ApprovalFilterKey,
  approvalFilterKeys,
  type ApprovalFilters as ApprovalFiltersValues,
  type ApprovalRecord,
} from '../model/types';
import { useApprovalActions } from '../model/use-approval-actions';
import { useApprovalList } from '../model/use-approval-list';
import { ApprovalFilters } from './approval-filters';

export const ApprovalPage = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const {
    clearFilters,
    filters,
    pagination,
    queryParams,
    searchText,
    setFilter,
    setFilters,
    setSearchText,
  } = useUrlListState<string, ApprovalFilterKey>({ filterKeys: approvalFilterKeys });
  const approvalFilters = filters as ApprovalFiltersValues;
  const warehousesQuery = useAllWarehouses(true);
  const list = useApprovalList({
    filters: approvalFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });
  const actions = useApprovalActions();
  const selectableIds = useMemo(
    () => list.records.filter((record) => record.status_id === 1).map((record) => record.id),
    [list.records],
  );
  const selectionKey = JSON.stringify({
    filters: approvalFilterKeys.map((key) => approvalFilters[key]),
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });
  const [selection, setSelection] = useState({ ids: [] as number[], key: selectionKey });
  const selectedIds = useMemo(
    () =>
      selection.key === selectionKey
        ? selection.ids.filter((id) => selectableIds.includes(id))
        : [],
    [selectableIds, selection, selectionKey],
  );
  const setSelectedIds = useCallback(
    (value: SetStateAction<number[]>) => {
      setSelection((currentSelection) => {
        const currentIds = currentSelection.key === selectionKey ? currentSelection.ids : [];

        return {
          ids: typeof value === 'function' ? value(currentIds) : value,
          key: selectionKey,
        };
      });
    },
    [selectionKey],
  );
  const appliedFilters = useMemo(
    () => getAppliedApprovalFilters(approvalFilters, warehousesQuery.warehouses),
    [approvalFilters, warehousesQuery.warehouses],
  );

  const downloadInvoice = async (record: ApprovalRecord) => {
    try {
      setDownloadingId(record.id);
      const response = await httpClient.get<Blob>(approvalEndpoints.invoice(record.id), {
        responseType: 'blob',
      });
      downloadBlob(response.data, `invoice-${record.invoice_number || record.id}.pdf`);
      snackbar.show({ title: 'Накладная скачана', type: 'success' });
    } catch {
      snackbar.show({ title: 'Не удалось скачать накладную', type: 'error' });
    } finally {
      setDownloadingId(null);
    }
  };

  const runAction = async (action: 'approve' | 'reject') => {
    if (!selectedIds.length) return;
    try {
      const response = await actions[action](selectedIds);
      if (response.code !== 200) throw new Error(response.message);
      snackbar.show({
        title: action === 'approve' ? 'Операции приняты' : 'Операции отклонены',
        type: 'success',
      });
      setSelectedIds([]);
    } catch {
      snackbar.show({ title: 'Не удалось выполнить действие', type: 'error' });
    }
  };

  const toggleRecord = useCallback(
    (record: ApprovalRecord) => {
      if (record.status_id !== 1) return;

      setSelectedIds((currentIds) =>
        currentIds.includes(record.id)
          ? currentIds.filter((id) => id !== record.id)
          : [...currentIds, record.id],
      );
    },
    [setSelectedIds],
  );

  const columns = useMemo<DataTableProps<ApprovalRecord>['columns']>(
    () => [
      {
        accessor: 'description',
        minWidth: '240px',
        renderRowCell: (record) => record.description || '-',
        title: 'Описание',
      },
      {
        accessor: 'from_storage_name',
        minWidth: '220px',
        renderRowCell: (record) =>
          formatApprovalLocation(
            record.from_department_name,
            record.from_subdivision_name,
            record.from_storage_name,
          ),
        title: 'Откуда',
      },
      {
        accessor: 'to_storage_name',
        minWidth: '220px',
        renderRowCell: (record) =>
          formatApprovalLocation(
            record.to_department_name,
            record.to_subdivision_name,
            record.to_storage_name,
          ),
        title: 'Куда',
      },
      {
        accessor: 'quantity',
        minWidth: '120px',
        renderRowCell: (record) => formatApprovalQuantity(record.quantity),
        title: 'Количество',
      },
      {
        accessor: 'operation_type_name',
        minWidth: '150px',
        renderRowCell: (record) => record.operation_type_name || '-',
        title: 'Тип операции',
      },
      {
        accessor: 'item_type_name',
        minWidth: '130px',
        renderRowCell: (record) => record.item_type_name || '-',
        title: 'Тип товара',
      },
      {
        accessor: 'invoice_number',
        minWidth: '160px',
        renderRowCell: (record) => record.invoice_number || '-',
        title: 'Номер накладной',
      },
      {
        accessor: 'created_time',
        minWidth: '140px',
        renderRowCell: (record) => (record.created_time ? formatDate(record.created_time) : '-'),
        title: 'Дата создания',
      },
      {
        accessor: 'status_name',
        minWidth: '150px',
        renderRowCell: (record) => (
          <Badge size="m" type="secondary" variant={getApprovalStatusVariant(record.status_id)}>
            {record.status_name || '-'}
          </Badge>
        ),
        title: 'Статус',
      },
      {
        accessor: 'actions',
        maxWidth: '80px',
        renderRowCell: (record) => (
          <Button
            type="button"
            variant={record.status_id === 1 ? 'tertiary' : 'primary'}
            size="s"
            isIconBtn
            disabled={downloadingId === record.id}
            isLoading={downloadingId === record.id}
            onClick={(event) => {
              event.stopPropagation();
              void downloadInvoice(record);
            }}
          >
            <OutlineSystemDownload />
          </Button>
        ),
        textAlign: 'end',
        title: '',
      },
    ],
    [downloadingId],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
        Одобрение
      </Typography>
      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <div className="flex min-w-0 flex-wrap gap-3">
          <Search
            className="min-w-70 flex-1"
            label="Поиск"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onClear={() => setSearchText('')}
            fullWidth
            proportions="l"
          />
          <ApprovalFilters
            filters={approvalFilters}
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
          onRemove={(filter) => setFilter(filter.key, [])}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
            Выбрано: {selectedIds.length}
          </Typography>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={!selectedIds.length}
              isLoading={actions.isPending}
              onClick={() => void runAction('approve')}
            >
              Принять
            </Button>
            <Button
              type="button"
              variant="outline-neutral"
              disabled={!selectedIds.length}
              isLoading={actions.isPending}
              onClick={() => void runAction('reject')}
            >
              Отклонить
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          records={list.records}
          isFetching={list.isFetching}
          isLoading={list.isLoading}
          selectedRecords={selectedIds}
          onSelectedRecordsChange={(nextSelectedIds) =>
            setSelectedIds((currentIds) => {
              const ids =
                typeof nextSelectedIds === 'function'
                  ? nextSelectedIds(currentIds)
                  : nextSelectedIds;

              return ids.filter((id) => selectableIds.includes(id)).map(Number);
            })
          }
          onRowClick={toggleRecord}
          tableClassNames={{
            row: (record) =>
              record.status_id === 1
                ? 'cursor-pointer'
                : 'cursor-not-allowed bg-(--color-bg-secondary) [&>td:not(:last-child)]:opacity-50 [&>td:not(:last-child)]:grayscale',
          }}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Здесь пока нет данных для подтверждения.'
          }
          pagination={{ ...pagination, totalCount: list.totalCount }}
        />
      </Surface>
    </section>
  );
};
