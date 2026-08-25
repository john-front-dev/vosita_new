import { type ReactNode, useMemo } from 'react';

export type GroupedDataTableColumn<T> = {
  accessor?: keyof T & string;
  align?: 'left' | 'center' | 'right';
  children?: GroupedDataTableColumn<T>[];
  id: string;
  minWidth?: number | string;
  width?: number | string;
  renderCell?: (record: T, index: number) => ReactNode;
  title: ReactNode;
};

type GroupedDataTableProps<T> = {
  className?: string;
  columns: GroupedDataTableColumn<T>[];
  emptyPlaceholder?: ReactNode;
  isLoading?: boolean;
  records: T[];
  skeletonRowsCount?: number;
};

type HeaderCell<T> = {
  column: GroupedDataTableColumn<T>;
  colSpan: number;
  rowSpan: number;
};

const getDepth = <T,>(columns: GroupedDataTableColumn<T>[]): number =>
  1 + Math.max(0, ...columns.map((column) => (column.children ? getDepth(column.children) : 0)));

const getLeafColumns = <T,>(columns: GroupedDataTableColumn<T>[]): GroupedDataTableColumn<T>[] =>
  columns.flatMap((column) => (column.children?.length ? getLeafColumns(column.children) : [column]));

const getColumnCount = <T,>(column: GroupedDataTableColumn<T>): number =>
  column.children?.length ? column.children.reduce((count, child) => count + getColumnCount(child), 0) : 1;

const getCellValue = <T,>(record: T, column: GroupedDataTableColumn<T>, index: number) => {
  const value = column.renderCell?.(record, index) ?? (column.accessor ? record[column.accessor] : undefined);

  return value === undefined || value === null || value === '' ? '-' : (value as ReactNode);
};

/** A scrollable report table with any number of grouped header levels. */
export const GroupedDataTable = <T,>({
  className = '',
  columns,
  emptyPlaceholder = 'Нет данных',
  isLoading = false,
  records,
  skeletonRowsCount = 10,
}: GroupedDataTableProps<T>) => {
  const headerDepth = useMemo(() => getDepth(columns), [columns]);
  const leafColumns = useMemo(() => getLeafColumns(columns), [columns]);
  const headerRows = useMemo(() => {
    const rows: HeaderCell<T>[][] = Array.from({ length: headerDepth }, () => []);
    const visit = (column: GroupedDataTableColumn<T>, level: number) => {
      const hasChildren = Boolean(column.children?.length);
      rows[level].push({
        column,
        colSpan: getColumnCount(column),
        rowSpan: hasChildren ? 1 : headerDepth - level,
      });
      column.children?.forEach((child) => visit(child, level + 1));
    };

    columns.forEach((column) => visit(column, 0));
    return rows;
  }, [columns, headerDepth]);

  return (
    <div className={'w-full ' + className}>
      <div className="max-h-[calc(100vh-220px)] w-full overflow-auto rounded-10 border border-[#dce8f1]">
        <table className="w-max min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-20">
          {headerRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map(({ column, colSpan, rowSpan }) => (
                <th
                  key={column.id}
                  colSpan={colSpan}
                  rowSpan={rowSpan}
                  className={
                    'border border-[#dce8f1] bg-[#cfd9de] px-2.5 py-1.25 text-center text-sm font-medium whitespace-normal text-[#202b33] ' +
                    (getLeafColumns([column])[0]?.id === leafColumns[0]?.id
                      ? 'sticky left-0 z-30 '
                      : '')
                  }
                  style={{ minWidth: column.minWidth, width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRowsCount }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {leafColumns.map((column) => (
                  <td
                    key={column.id}
                    className={
                      'border border-[#dce8f1] bg-[#f1f1f1] px-2.5 py-1.25 ' +
                      (column === leafColumns[0] ? 'sticky left-0 z-10 ' : '')
                    }
                    style={{
                      backgroundColor: column === leafColumns[0] ? '#cfd9de' : '#f1f1f1',
                      minWidth: column.minWidth,
                      width: column.width,
                    }}
                  >
                    <div className="h-4 min-w-24 animate-pulse rounded bg-[#dce8f1]" />
                  </td>
                ))}
              </tr>
            ))
          ) : records.length ? (
            records.map((record, rowIndex) => (
              <tr key={rowIndex} className="bg-[#f1f1f1]">
                {leafColumns.map((column) => (
                  <td
                    key={column.id}
                    className={
                      'border border-[#dce8f1] bg-[#f1f1f1] px-2.5 py-1.25 align-top text-[#202b33] [overflow-wrap:anywhere] ' +
                      (column === leafColumns[0] ? 'sticky left-0 z-10 ' : '')
                    }
                    style={{
                      backgroundColor: column === leafColumns[0] ? '#cfd9de' : '#f1f1f1',
                      minWidth: column.minWidth,
                      textAlign: column.align ?? 'left',
                      width: column.width,
                    }}
                  >
                    {getCellValue(record, column, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={leafColumns.length} className="bg-[#f1f1f1] px-4 py-12 text-center text-[#687882]">
                {emptyPlaceholder}
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
};
