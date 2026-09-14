import { useMemo, useState } from 'react';
import { Button, OutlineSystemTrash, Search, snackbar, Surface, Typography } from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';
import { formatMoney, useUrlListState } from '@shared/lib';
import { ConfirmModal, DataTable, type DataTableProps } from '@shared/ui';

import { capitalizationEndpoints } from '../api/capitalization-api';
import { formatCapitalizationDate } from '../model/capitalization-utils';
import type { CapitalizationRecord } from '../model/types';
import { useCapitalizationList } from '../model/use-capitalization-list';
import { CapitalizationDetailsModal } from './capitalization-details-modal';

export const CapitalizationPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { pagination, queryParams, searchText, setSearchText } = useUrlListState();
  const list = useCapitalizationList({
    LIMIT: queryParams.limit,
    NAME: queryParams.searchText,
    PAGE: queryParams.page,
  });
  const removeMutation = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: capitalizationEndpoints.list,
    options: {
      onSuccess: () => {
        setRemovingId(null);
        snackbar.show({ title: 'Запись капитализации удалена', type: 'success' });
        void queryClient.invalidateQueries({ queryKey: ['capitalization-list'] });
      },
      onError: () =>
        snackbar.show({ title: 'Не удалось удалить запись капитализации', type: 'error' }),
    },
  });
  const columns = useMemo<DataTableProps<CapitalizationRecord>['columns']>(
    () => [
      {
        accessor: 'capitalization',
        minWidth: '180px',
        renderRowCell: (record) =>
          formatMoney(record.capitalization, { currency: record.currency || undefined }),
        title: 'Сумма',
      },
      {
        accessor: 'warehouse_name',
        minWidth: '240px',
        renderRowCell: (record) => record.warehouse_name || '-',
        title: 'Объект',
      },
      {
        accessor: 'comment',
        minWidth: '320px',
        renderRowCell: (record) => record.comment || 'Без описания',
        title: 'Описание',
      },
      {
        accessor: 'capitalization_month',
        minWidth: '140px',
        renderRowCell: formatCapitalizationDate,
        title: 'Дата',
      },
      {
        accessor: 'actions',
        maxWidth: '72px',
        minWidth: '72px',
        renderRowCell: (record) => (
          <Button
            type="button"
            variant="tertiary"
            size="s"
            isIconBtn
            aria-label="Удалить запись капитализации"
            onClick={(event) => {
              event.stopPropagation();
              setRemovingId(record.id);
            }}
          >
            <OutlineSystemTrash />
          </Button>
        ),
        textAlign: 'end',
        title: '',
      },
    ],
    [],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
        Капитализация
      </Typography>

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
          columns={columns}
          records={list.records}
          isFetching={list.isFetching}
          isLoading={list.isLoading}
          onRowClick={(record) => setSelectedId(record.id)}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Список капитализаций пока пуст.'
          }
          pagination={{ ...pagination, totalCount: list.totalCount }}
        />
      </Surface>

      <CapitalizationDetailsModal
        capitalizationId={selectedId}
        onClose={() => setSelectedId(null)}
      />
      <ConfirmModal
        isOpen={removingId !== null}
        title="Вы уверены, что хотите удалить запись капитализации?"
        message="После удаления записи её нельзя будет восстановить."
        confirmText="Удалить"
        variant="risk"
        isConfirmLoading={removeMutation.isPending}
        onClose={() => setRemovingId(null)}
        onConfirm={() => {
          if (removingId !== null) {
            removeMutation.mutate({ url: capitalizationEndpoints.remove(removingId) });
          }
        }}
      />
    </section>
  );
};
