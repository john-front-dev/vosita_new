import { useMemo, useState } from 'react';
import { Badge, Search, Surface, Typography } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import { useCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { useBuildings, useCities } from '@entities/location';
import {
  getStockAssetStatusBadgeVariant,
  getStockAssetStatusLabel,
  type StockAsset,
} from '@entities/stock-asset';
import { routes } from '@shared/config';
import { formatMoney, useUrlListState } from '@shared/lib';
import { AppliedFilterTags, DataTable, type DataTableProps } from '@shared/ui';

import { getAppliedOthersFilters } from '../lib/others-filter-tags';
import {
  othersDefaultFilters,
  type OthersFilterKey,
  othersFilterKeys,
  type OthersFilters as OthersFiltersValues,
} from '../model/others-filters';
import { useOthersList } from '../model/use-others-list';
import { OthersFilters } from './others-filters';

export const OthersPage = () => {
  const navigate = useNavigate();
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
  } = useUrlListState<string, OthersFilterKey>({ filterKeys: othersFilterKeys });
  const othersFilters = useMemo<OthersFiltersValues>(
    () => ({ ...othersDefaultFilters, ...filters }),
    [filters],
  );
  const { cities } = useCities('', Boolean(othersFilters.CITY_ID[0]));
  const { buildings } = useBuildings(
    othersFilters.CITY_ID[0],
    '',
    Boolean(othersFilters.BUILDING_ID[0]),
  );
  const { categories } = useCategories('', Boolean(othersFilters.CATEGORY_ID[0]));
  const { employees: warehouseManagers } = useEmployees(
    '',
    Boolean(othersFilters.WAREHOUSE_MANAGER_ID[0]),
    '3,4',
  );
  const { employees: responsiblePeople } = useEmployees(
    '',
    Boolean(othersFilters.RESPONSIBLE_PERSON_ID[0]),
    '1,4',
  );
  const { employees: exploiters } = useEmployees('', Boolean(othersFilters.EXPLOITER_ID[0]));
  const appliedFilters = useMemo(
    () =>
      getAppliedOthersFilters(othersFilters, {
        buildings,
        categories,
        cities,
        exploiters,
        responsiblePeople,
        warehouseManagers,
      }),
    [
      buildings,
      categories,
      cities,
      exploiters,
      othersFilters,
      responsiblePeople,
      warehouseManagers,
    ],
  );
  const { records, isFetching, isLoading, totalCount } = useOthersList({
    filters: othersFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });
  const columns = useMemo<DataTableProps<StockAsset>['columns']>(
    () => [
      {
        accessor: 'inventory_number',
        minWidth: '200px',
        renderRowCell: (record) => record.inventory_number || '-',
        title: 'Инвентарный номер',
      },
      {
        accessor: 'name',
        minWidth: '280px',
        title: 'Наименование объекта',
      },
      {
        accessor: 'building',
        minWidth: '200px',
        renderRowCell: (record) => record.building || '-',
        title: 'Здание',
      },
      {
        accessor: 'price',
        minWidth: '160px',
        renderRowCell: (record) => formatMoney(record.price, { currency: record.currency }),
        title: 'Стоимость',
      },
      {
        accessor: 'status_id',
        minWidth: '210px',
        renderRowCell: (record) => (
          <Badge
            className="whitespace-nowrap"
            size="m"
            type="secondary"
            variant={
              record.is_repair === 1 ? 'error' : getStockAssetStatusBadgeVariant(record.status_id)
            }
          >
            {record.is_repair === 1 ? 'В ремонте' : getStockAssetStatusLabel(record.status_id)}
          </Badge>
        ),
        title: 'Статус',
      },
    ],
    [],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
        Другие
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
          <OthersFilters
            filters={othersFilters}
            isOpen={isFiltersOpen}
            onClick={() => setIsFiltersOpen(true)}
            onApply={(nextFilters) => {
              setFilters(nextFilters);
              setIsFiltersOpen(false);
            }}
            onClose={() => setIsFiltersOpen(false)}
          />
        </div>

        <AppliedFilterTags
          filters={appliedFilters}
          getKey={(filter) => filter.key}
          onClear={clearFilters}
          onRemove={(filter) => setFilter(filter.key, [])}
        />

        <DataTable
          columns={columns}
          records={records}
          isFetching={isFetching}
          isLoading={isLoading}
          onRowClick={(record) => navigate(routes.othersDetails.replace(':id', String(record.id)))}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Список пока пуст (возможно, по выбранным фильтрам ничего не нашлось).'
          }
          pagination={{ ...pagination, totalCount }}
        />
      </Surface>
    </section>
  );
};
