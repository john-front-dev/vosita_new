import { useMemo, useState } from 'react';
import {
  Button,
  OutlineSystemRefresh,
  Search,
  SegmentedControl,
  snackbar,
  Surface,
  Typography,
} from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';
import { formatMoney, useUrlListState } from '@shared/lib';
import { ConfirmModal, DataTable, type DataTableProps } from '@shared/ui';

import { trashEndpoints } from '../api/trash-api';
import { trashTabs, trashTypeLabels } from '../model/trash-tabs';
import type { TrashedAsset, TrashedLri, TrashRecord } from '../model/types';
import { isTrashType } from '../model/types';
import { useTrashList } from '../model/use-trash-list';

export const TrashPage = () => {
  const [restoringRecord, setRestoringRecord] = useState<TrashRecord | null>(null);
  const { pagination, queryParams, searchText, setSearchText, setType, type } = useUrlListState({
    clearOnTypeChange: true,
    defaultType: 'fixed-assets',
    isType: isTrashType,
  });
  const list = useTrashList({
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
    type,
  });
  const restoreMutation = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'post',
    url: '',
    options: {
      onSuccess: (response) => {
        if (response?.code !== undefined && response.code !== 200) {
          snackbar.show({
            title: response.message || 'Не удалось восстановить объект',
            type: 'error',
          });
          return;
        }
        setRestoringRecord(null);
        snackbar.show({ title: 'Объект восстановлен', type: 'success' });
        void queryClient.invalidateQueries({ queryKey: ['trash-list', type] });
      },
    },
  });
  const columns = useMemo<DataTableProps<TrashRecord>['columns']>(() => {
    const result: DataTableProps<TrashRecord>['columns'] =
      type === 'lri'
        ? [
            { accessor: 'name', minWidth: '260px', title: 'Наименование' },
            { accessor: 'application_id', minWidth: '140px', title: 'ID запроса' },
            {
              accessor: 'count',
              minWidth: '150px',
              renderRowCell: (record) => {
                const lri = record as TrashedLri;
                return `${lri.count} ${lri.unit}`;
              },
              title: 'Количество',
            },
            {
              accessor: 'price',
              minWidth: '150px',
              renderRowCell: (record) => {
                const lri = record as TrashedLri;
                return formatMoney(lri.price, { currency: lri.currency });
              },
              title: 'Цена',
            },
            {
              accessor: 'sum',
              minWidth: '170px',
              renderRowCell: (record) => {
                const lri = record as TrashedLri;
                return formatMoney(lri.count * lri.price, { currency: lri.currency });
              },
              title: 'Сумма',
            },
          ]
        : [
            {
              accessor: 'inventory_number',
              minWidth: '190px',
              renderRowCell: (record) => (record as TrashedAsset).inventory_number || '-',
              title: 'Инвентарный номер',
            },
            { accessor: 'name', minWidth: '280px', title: 'Наименование объекта' },
            {
              accessor: 'building',
              minWidth: '200px',
              renderRowCell: (record) => (record as TrashedAsset).building || '-',
              title: 'Здание',
            },
            {
              accessor: 'price',
              minWidth: '160px',
              renderRowCell: (record) => {
                const asset = record as TrashedAsset;
                return formatMoney(asset.price, { currency: asset.currency });
              },
              title: 'Цена',
            },
          ];

    return [
      ...result,
      {
        accessor: 'actions',
        minWidth: '72px',
        renderRowCell: (record) => (
          <Button
            type="button"
            variant="tertiary"
            size="s"
            isIconBtn
            aria-label="Восстановить"
            onClick={(event) => {
              event.stopPropagation();
              setRestoringRecord(record);
            }}
          >
            <OutlineSystemRefresh />
          </Button>
        ),
        textAlign: 'end',
        title: '',
      },
    ];
  }, [type]);

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          Корзина
        </Typography>
        <SegmentedControl
          tabs={trashTabs}
          value={type}
          onChange={setType}
          rounded
          size="m"
          variant="accent"
        />
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
          columns={columns}
          records={list.records}
          isFetching={list.isFetching}
          isLoading={list.isLoading}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску «${queryParams.searchText}» ничего не найдено.`
              : `В корзине пока нет объектов «${trashTypeLabels[type]}».`
          }
          pagination={{ ...pagination, totalCount: list.totalCount }}
        />
      </Surface>

      <ConfirmModal
        isOpen={restoringRecord !== null}
        title={`Восстановить ${trashTypeLabels[type]}?`}
        message="Объект будет возвращён из корзины."
        confirmText="Восстановить"
        isConfirmLoading={restoreMutation.isPending}
        onClose={() => setRestoringRecord(null)}
        onConfirm={() => {
          if (restoringRecord) {
            restoreMutation.mutate({ url: trashEndpoints.restore(restoringRecord.id) });
          }
        }}
      />
    </section>
  );
};
