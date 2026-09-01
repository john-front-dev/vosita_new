import { useMemo } from 'react';
import { Typography } from 'alif-ui';

import { TmzGoodInvoiceDownloadButton } from '@features/tmz-good-actions';
import { type TmzGoodHistory, useTmzGoodHistory } from '@entities/tmz-good';
import { formatMoney } from '@shared/lib';
import { DataTable, type DataTableProps } from '@shared/ui';

const operationClass = (operation: string) => {
  if (operation === 'приход') return 'text-(--color-success)';
  if (operation === 'перемещение') return 'text-(--color-warning)';
  return 'text-(--color-danger)';
};

type Props = {
  goodsId: string;
  storageId: string;
};

export const TmzGoodHistoryTable = ({ goodsId, storageId }: Props) => {
  const query = useTmzGoodHistory(goodsId, storageId);
  const columns = useMemo<DataTableProps<TmzGoodHistory>['columns']>(
    () => [
      {
        accessor: 'to_department_name',
        minWidth: '150px',
        sortable: true,
        title: 'Город',
        renderRowCell: (item) => <span className="pl-4">{item.to_department_name}</span>,
      },
      { accessor: 'to_subdivision_name', minWidth: '160px', sortable: true, title: 'Здание' },
      { accessor: 'to_storage_name', minWidth: '150px', sortable: true, title: 'Склад' },
      { accessor: 'to_cabinet_name', minWidth: '130px', sortable: true, title: 'Кабинет' },
      { accessor: 'previous_quantity', minWidth: '130px', sortable: true, title: 'Остаток был' },
      {
        accessor: 'quantity',
        minWidth: '110px',
        sortable: true,
        title: 'Количество',
        renderRowCell: (item) => (
          <span className={operationClass(item.operation_type)}>
            {item.quantity ?? item.qty ?? '-'}
          </span>
        ),
      },
      {
        accessor: 'price',
        minWidth: '130px',
        sortable: true,
        title: 'Сумма',
        renderRowCell: (item) => formatMoney(Number(item.price) || 0, { currency: 'TJS' }),
      },
      {
        accessor: 'operation_type',
        minWidth: '140px',
        sortable: true,
        title: 'Тип операции',
        renderRowCell: (item) => (
          <span className={operationClass(item.operation_type)}>{item.operation_type}</span>
        ),
      },
      { accessor: 'date', minWidth: '130px', sortable: true, title: 'Дата' },
      {
        accessor: 'invoice_number',
        minWidth: '150px',
        sortable: true,
        title: 'Номер накладной',
        renderRowCell: (item) => <TmzGoodInvoiceDownloadButton history={item} />,
      },
    ],
    [],
  );

  if (query.isError) {
    return (
      <Typography category="body" proportions="s" className="p-4 text-(--color-danger)">
        Не удалось загрузить историю партии.
      </Typography>
    );
  }

  return (
    <DataTable
      accessorId="id"
      columns={columns}
      records={query.history}
      isLoading={query.isLoading}
      emptyPlaceholder="История партии пуста"
      rowSpacing="s"
    />
  );
};
