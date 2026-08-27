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
  footer?: ReactNode;
  isLoading?: boolean;
  maxHeightClassName?: string;
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
  columns.flatMap((column) =>
    column.children?.length ? getLeafColumns(column.children) : [column],
  );

const getColumnCount = <T,>(column: GroupedDataTableColumn<T>): number =>
  column.children?.length
    ? column.children.reduce((count, child) => count + getColumnCount(child), 0)
    : 1;

const getCellValue = <T,>(record: T, column: GroupedDataTableColumn<T>, index: number) => {
  const value =
    column.renderCell?.(record, index) ?? (column.accessor ? record[column.accessor] : undefined);

  return value === undefined || value === null || value === '' ? '-' : (value as ReactNode);
};

/** A scrollable report table with any number of grouped header levels. */
export const GroupedDataTable = <T,>({
  className = '',
  columns,
  emptyPlaceholder = 'Нет данных',
  footer,
  isLoading = false,
  maxHeightClassName = 'max-h-[calc(100vh-200px)]',
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
      <div
        className={`${maxHeightClassName} w-full overflow-auto rounded-lg border border-(--color-table-border)`}
      >
        <table className="w-max min-w-full border-separate border-spacing-0 text-base">
          <thead className="sticky top-0 z-20">
            {headerRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map(({ column, colSpan, rowSpan }) => (
                  <th
                    key={column.id}
                    colSpan={colSpan}
                    rowSpan={rowSpan}
                    className={
                      'border-r border-b border-(--color-table-border) bg-(--color-table-header) px-2.5 py-1.25 text-center text-base font-medium whitespace-normal text-(--color-table-text) ' +
                      (getLeafColumns([column])[0]?.id === leafColumns[0]?.id
                        ? 'sticky left-0 z-30 shadow-[1px_0_0_var(--color-table-border)]'
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
                        'border-r border-b border-(--color-table-border) bg-(--color-table-body) px-2.5 py-1.25 ' +
                        (column === leafColumns[0]
                          ? 'sticky left-0 z-10 shadow-[1px_0_0_var(--color-table-border)]'
                          : '')
                      }
                      style={{
                        backgroundColor:
                          column === leafColumns[0]
                            ? 'var(--color-table-header)'
                            : 'var(--color-table-body)',
                        minWidth: column.minWidth,
                        width: column.width,
                      }}
                    >
                      <div className="h-4 min-w-24 animate-pulse rounded bg-(--color-table-border)" />
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length ? (
              records.map((record, rowIndex) => (
                <tr key={rowIndex} className="bg-(--color-table-body)">
                  {leafColumns.map((column) => (
                    <td
                      key={column.id}
                      className={
                        'max-w-62.5 border-r border-b border-(--color-table-border) bg-(--color-table-body) px-2.5 py-1.25 align-top wrap-anywhere text-(--color-table-text) ' +
                        (column === leafColumns[0]
                          ? 'sticky left-0 z-10 shadow-[1px_0_0_var(--color-table-border)]'
                          : '')
                      }
                      style={{
                        backgroundColor:
                          column === leafColumns[0]
                            ? 'var(--color-table-header)'
                            : 'var(--color-table-body)',
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
                <td
                  colSpan={leafColumns.length}
                  className="bg-(--color-table-body) px-4 py-12 text-center text-(--color-table-text-muted)"
                >
                  {emptyPlaceholder}
                </td>
              </tr>
            )}
          </tbody>
          {footer && (
            <tfoot className="bg-(--color-table-header) [&>tr>td]:sticky [&>tr>td]:bottom-0 [&>tr>td]:z-20 [&>tr>td]:bg-(--color-table-header) [&>tr>td:first-child]:left-0 [&>tr>td:first-child]:z-30 [&>tr>td:first-child]:shadow-[1px_0_0_var(--color-table-border)]">
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
