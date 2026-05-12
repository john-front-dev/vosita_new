import { Pagination, type PaginationProps, Table, type TableProps } from 'alif-ui';
import type { ReactNode } from 'react';

import { paginationConfig } from '@shared/config';

type RowClassName<T> = NonNullable<TableProps<T>['tableClassNames']>['row'];
type RowContentClassName<T> = NonNullable<TableProps<T>['tableClassNames']>['rowContent'];
type DataTableColumn<T> = NonNullable<TableProps<T>['columns']>[number];

type DataTablePagination = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageOptions?: number[];
};

export type DataTableProps<T> = Omit<TableProps<T>, 'columns' | 'records'> & {
  columns: TableProps<T>['columns'];
  records: T[];
  pagination?: DataTablePagination;
  paginationProps?: Omit<
    PaginationProps,
    'currentPage' | 'onPageChange' | 'onPageSizeChange' | 'pageOptions' | 'pageSize' | 'totalCount'
  >;
  className?: string;
  footer?: ReactNode;
  hidePaginationWhenEmpty?: boolean;
  isFetching?: boolean;
};

const renderDefaultCellContent = (value: string | number) => {
  const text = String(value).trim();

  if (!text) {
    return '-';
  }

  return (
    <div
      title={text}
      className="max-w-130 overflow-hidden wrap-break-word text-ellipsis"
      style={{
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        display: '-webkit-box',
      }}
    >
      {text}
    </div>
  );
};

const isPrimitiveCellValue = (value: ReactNode): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

export const DataTable = <T,>({
  columns,
  records,
  pagination,
  paginationProps,
  className,
  footer,
  hidePaginationWhenEmpty = true,
  emptyPlaceholder = 'Нет данных',
  isFetching = false,
  isLoading = false,
  withRowBorders = true,
  ...tableProps
}: DataTableProps<T>) => {
  const shouldShowPagination =
    Boolean(pagination) && (!hidePaginationWhenEmpty || Boolean(pagination?.totalCount));
  const isClickable = Boolean(tableProps.onRowClick);
  const shouldShowSkeleton = Boolean(isLoading || isFetching);

  const handlePageSizeChange = (pageSize: unknown) => {
    const resolvedPageSize =
      typeof pageSize === 'object' && pageSize !== null && 'value' in pageSize
        ? Number(pageSize.value)
        : Number(pageSize);

    if (Number.isNaN(resolvedPageSize)) {
      return;
    }

    pagination?.onPageSizeChange?.(resolvedPageSize);
  };

  const getClickableClassName = <TRecord,>(
    className: RowClassName<TRecord> | RowContentClassName<TRecord>,
    record: TRecord,
  ) => {
    const resolvedClassName = typeof className === 'function' ? className(record) : className;

    return [resolvedClassName, isClickable ? 'cursor-pointer' : ''].filter(Boolean).join(' ');
  };

  const normalizedColumns = columns.map((column) => {
    const originalRenderRowCell = column.renderRowCell;

    return {
      ...column,
      renderRowCell: (record: T, index: number) => {
        const renderedValue = originalRenderRowCell?.(record, index);

        if (isPrimitiveCellValue(renderedValue)) {
          return renderDefaultCellContent(renderedValue);
        }

        if (renderedValue !== undefined) {
          return renderedValue;
        }

        if (typeof column.accessor === 'string') {
          const rawValue = (record as Record<string, unknown>)[column.accessor];

          if (typeof rawValue === 'string' || typeof rawValue === 'number') {
            return renderDefaultCellContent(rawValue);
          }
        }

        return renderedValue;
      },
    } satisfies DataTableColumn<T>;
  });

  return (
    <div className={'flex flex-1 flex-col justify-between ' + className}>
      <Table
        columns={normalizedColumns}
        records={records}
        emptyPlaceholder={emptyPlaceholder}
        withRowBorders={withRowBorders}
        isLoading={shouldShowSkeleton}
        {...tableProps}
        tableClassNames={{
          ...tableProps.tableClassNames,
          row: (record) => getClickableClassName(tableProps.tableClassNames?.row, record),
          rowContent: (record) =>
            getClickableClassName(tableProps.tableClassNames?.rowContent, record),
        }}
      />

      {(shouldShowPagination || footer) && (
        <div className="flex items-center justify-center gap-3 pt-4">
          {shouldShowPagination && pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              pageSize={pagination.pageSize}
              totalCount={pagination.totalCount}
              onPageChange={pagination.onPageChange}
              onPageSizeChange={handlePageSizeChange}
              pageOptions={pagination.pageOptions ?? [...paginationConfig.pageOptions]}
              size="m"
              variant="default"
              rounded
              showFirstLastButton
              showPages
              {...paginationProps}
            />
          )}
        </div>
      )}
    </div>
  );
};
