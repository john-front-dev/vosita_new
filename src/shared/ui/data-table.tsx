import { Pagination, type PaginationProps, Table, type TableProps } from 'alif-ui';
import type { ReactNode } from 'react';

import { paginationConfig } from '@shared/config';

type RowClassName<T> = NonNullable<TableProps<T>['tableClassNames']>['row'];
type RowContentClassName<T> = NonNullable<TableProps<T>['tableClassNames']>['rowContent'];

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

  return (
    <div className={'flex flex-1 flex-col justify-between ' + className}>
      <Table
        columns={columns}
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
