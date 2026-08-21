import { type ReactNode, useRef } from 'react';
import { Pagination, type PaginationProps, Table, type TableProps } from 'alif-ui';

import { paginationConfig } from '@shared/config';

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
  children?: ReactNode;
  pagination?: DataTablePagination;
  paginationProps?: Omit<
    PaginationProps,
    'currentPage' | 'onPageChange' | 'onPageSizeChange' | 'pageOptions' | 'pageSize' | 'totalCount'
  >;
  className?: string;
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

export const DataTable = <T,>({
  columns,
  records,
  children,
  pagination,
  paginationProps,
  className,
  hidePaginationWhenEmpty = true,
  emptyPlaceholder = 'Нет данных',
  isFetching = false,
  isLoading = false,
  withRowBorders = true,
  ...tableProps
}: DataTableProps<T>) => {
  const shouldShowPagination =
    Boolean(pagination) && (!hidePaginationWhenEmpty || Boolean(pagination?.totalCount));
  const shouldShowSkeleton = Boolean(isLoading || isFetching);
  const shouldSkipNextPageResetRef = useRef(false);

  const handlePageChange = (page: number) => {
    if (shouldSkipNextPageResetRef.current && page === paginationConfig.defaultPage) {
      shouldSkipNextPageResetRef.current = false;
      return;
    }

    shouldSkipNextPageResetRef.current = false;
    pagination?.onPageChange(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    shouldSkipNextPageResetRef.current = true;
    pagination?.onPageSizeChange?.(pageSize);
  };

  const normalizedColumns = columns.map((column) => ({
    ...column,
    renderRowCell: (record: T, index: number) => {
      const renderedValue = column.renderRowCell?.(record, index);

      if (renderedValue !== undefined) {
        return renderedValue;
      }

      const rawValue = (record as Record<string, unknown>)[column.accessor];

      if (typeof rawValue === 'string' || typeof rawValue === 'number') {
        return renderDefaultCellContent(rawValue);
      }

      return renderedValue;
    },
  })) satisfies DataTableColumn<T>[];

  return (
    <div className={'w-full ' + className}>
      <Table
        columns={normalizedColumns}
        records={records}
        emptyPlaceholder={emptyPlaceholder}
        withRowBorders={withRowBorders}
        isLoading={shouldShowSkeleton}
        {...tableProps}
      />

      {children}

      {shouldShowPagination && pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          className="mt-6 flex justify-center"
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
  );
};
