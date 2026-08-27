import type { GroupedDataTableColumn } from '@shared/ui';

import { formatHeaderDate, getDynamicColumns } from './tmz-report-utils';
import type { TmzReportRecord } from './types';

type BuildColumnsParams = {
  fromDate: string;
  isCompus: boolean;
  records: TmzReportRecord[];
  toDate: string;
};

const staticColumns: GroupedDataTableColumn<TmzReportRecord>[] = [
  { accessor: 'name', id: 'name', minWidth: 240, title: 'Наименование' },
  { accessor: 'unit', id: 'unit', minWidth: 100, title: 'Ед. изм.' },
  { accessor: 'received_date', id: 'received-date', minWidth: 145, title: 'Дата приобретения' },
  { accessor: 'price', id: 'price', minWidth: 110, title: 'Цена' },
];

const quantityAndSumColumns = (
  id: string,
  title: string,
): GroupedDataTableColumn<TmzReportRecord> => ({
  children: [
    { accessor: `${id}_qty`, id: `${id}-qty`, minWidth: 110, title: 'Кол-во' },
    { accessor: `${id}_sum`, id: `${id}-sum`, minWidth: 120, title: 'Сумма' },
  ],
  id,
  title,
});

export const buildTmzReportColumns = ({
  fromDate,
  isCompus,
  records,
  toDate,
}: BuildColumnsParams): GroupedDataTableColumn<TmzReportRecord>[] => {
  const movedColumns = getDynamicColumns(records, 'moved');
  const expensedColumns = getDynamicColumns(records, 'expensed');
  const columns: GroupedDataTableColumn<TmzReportRecord>[] = [
    ...staticColumns,
    quantityAndSumColumns('start_stock', `Остаток на ${formatHeaderDate(fromDate)}`),
    quantityAndSumColumns('received', 'Поступило'),
    quantityAndSumColumns('reserved', 'Резерв'),
    quantityAndSumColumns('canceled_reserved', 'Отменено с резерва'),
  ];

  if (movedColumns.length) {
    columns.push({ children: movedColumns, id: 'moved', title: 'Израсходовано по складам' });
  }

  if (!isCompus && expensedColumns.length) {
    columns.push({
      children: expensedColumns,
      id: 'expensed',
      title: 'Израсходовано по категориям',
    });
  }

  columns.push(
    quantityAndSumColumns('expensed', 'Всего израсходовано'),
    quantityAndSumColumns('end_stock', `Остаток на ${formatHeaderDate(toDate)}`),
  );

  return columns;
};

export const getLeafColumns = (
  columns: GroupedDataTableColumn<TmzReportRecord>[],
): GroupedDataTableColumn<TmzReportRecord>[] =>
  columns.flatMap((column) =>
    column.children?.length ? getLeafColumns(column.children) : [column],
  );

export const getColumnTotal = (
  records: TmzReportRecord[],
  column: GroupedDataTableColumn<TmzReportRecord>,
) =>
  records.reduce((sum, record) => {
    const value = column.accessor ? record[column.accessor] : undefined;
    return typeof value === 'number' ? sum + value : sum;
  }, 0);
