import { useMemo, useState } from 'react';
import { Search, Surface, Typography } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import { useCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import type { StockAsset } from '@entities/stock-asset';
import { routes } from '@shared/config';
import { formatMoney, getStoredUser, useUrlListState } from '@shared/lib';
import { AppliedFilterTags, DataTable, type DataTableProps } from '@shared/ui';

import { getAppliedMyFixedAssetsFilters } from '../lib/my-fixed-assets-filter-tags';
import {
  myFixedAssetsDefaultFilters,
  type MyFixedAssetsFilterKey,
  myFixedAssetsFilterKeys,
  type MyFixedAssetsFilters as MyFixedAssetsFiltersValues,
} from '../model/my-fixed-assets-filters';
import { useMyFixedAssetsList } from '../model/use-my-fixed-assets-list';
import { MyFixedAssetsFilters } from './my-fixed-assets-filters';

export const MyFixedAssetsPage = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const canManage = Boolean(user?.is_responsible_person);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const {
    clearFilters,
    filters,
    pagination,
    queryParams,
    searchText,
    setFilter,
    setFilters,
    setSearchText,
  } = useUrlListState<string, MyFixedAssetsFilterKey>({
    filterKeys: myFixedAssetsFilterKeys,
  });
  const myFixedAssetsFilters = useMemo<MyFixedAssetsFiltersValues>(
    () => ({ ...myFixedAssetsDefaultFilters, ...filters }),
    [filters],
  );
  const { employees } = useEmployees('', Boolean(myFixedAssetsFilters.EXPLOITER_ID[0]));
  const { categories } = useCategories('', Boolean(myFixedAssetsFilters.CATEGORY_ID[0]));
  const appliedFilters = useMemo(
    () => getAppliedMyFixedAssetsFilters(myFixedAssetsFilters, employees, categories),
    [categories, employees, myFixedAssetsFilters],
  );
  const { isFetching, isLoading, records, totalCount } = useMyFixedAssetsList({
    filters: myFixedAssetsFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });
  const columns = useMemo<DataTableProps<StockAsset>['columns']>(
    () => [
      {
        accessor: 'inventory_number',
        minWidth: '190px',
        renderRowCell: (record) => record.inventory_number || '-',
        title: 'Инвентарный номер',
      },
      {
        accessor: 'name',
        minWidth: '280px',
        title: 'Наименование объекта',
      },
      {
        accessor: 'exploiter',
        minWidth: '220px',
        renderRowCell: (record) => record.exploiter || '-',
        title: 'Пользователь',
      },
      {
        accessor: 'price',
        minWidth: '160px',
        renderRowCell: (record) =>
          record.price === undefined
            ? '-'
            : formatMoney(record.price, { currency: record.currency }),
        title: 'Цена',
      },
    ],
    [],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
        Мои ОС
      </Typography>
      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <div className="flex min-w-0 gap-3">
          <Search
            className="min-w-70 flex-1"
            label="Поиск"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onClear={() => setSearchText('')}
            fullWidth
            proportions="l"
          />
          {canManage && (
            <MyFixedAssetsFilters
              filters={myFixedAssetsFilters}
              isOpen={isFiltersOpen}
              onClick={() => setIsFiltersOpen(true)}
              onApply={(nextFilters) => {
                setFilters(nextFilters);
                setIsFiltersOpen(false);
              }}
              onClose={() => setIsFiltersOpen(false)}
            />
          )}
        </div>
        {canManage && (
          <AppliedFilterTags
            filters={appliedFilters}
            getKey={(filter) => filter.key}
            onClear={clearFilters}
            onRemove={(filter) => setFilter(filter.key, [])}
          />
        )}
        <DataTable
          columns={columns}
          records={records}
          isFetching={isFetching}
          isLoading={isLoading}
          onRowClick={
            canManage
              ? (record) => navigate(routes.fixedAssetsDetails.replace(':id', String(record.id)))
              : undefined
          }
          emptyPlaceholder={
            queryParams.searchText || appliedFilters.length
              ? 'По заданным условиям ничего не найдено.'
              : 'Список ОС пока пуст.'
          }
          pagination={{ ...pagination, totalCount }}
        />
      </Surface>
    </section>
  );
};
