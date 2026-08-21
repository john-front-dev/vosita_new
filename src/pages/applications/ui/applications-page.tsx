import { useMemo, useState } from 'react';
import {
  Button,
  OutlineSystemAdd,
  OutlineSystemFilterFromLessToMore,
  Search,
  SegmentedControl,
  Surface,
  Tag,
  Typography,
} from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import { useAccessibleWarehouses } from '@entities/location';
import { queryClient } from '@shared/api';
import { routes } from '@shared/config';
import { formatDate, getStoredAccesses, getStoredUser, useUrlListState } from '@shared/lib';
import { DataTable, type DataTableProps } from '@shared/ui';

import {
  getAvailableApplicationTabs,
  getDefaultApplicationListType,
  isApplicationListType,
} from '../lib/application-access';
import { getAppliedApplicationFilters } from '../lib/application-filter-tags';
import { applicationFilterKeys } from '../model/application-filters';
import type {
  ApplicationFilterKey,
  ApplicationFilters,
  ApplicationListType,
  ApplicationRecord,
} from '../model/types';
import { useApplicationsList } from '../model/use-applications-list';
import { ApplicationsFiltersModal } from './applications-filters-modal';
import { CreateApplicationModal } from './create-application-modal';

const getDetailsPath = (type: ApplicationListType, id: number) => {
  const detailsPathMap: Record<ApplicationListType, string> = {
    'fixed-assets': routes.applicationsFaDetails,
    lri: routes.applicationsLriDetails,
    mbp: routes.applicationsMbpDetails,
    other: routes.applicationsOtherDetails,
    tmz: routes.applicationsTmzDetails,
  };

  return detailsPathMap[type].replace(':id', String(id));
};

export const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const user = getStoredUser();
  const accesses = getStoredAccesses();
  const accessibleWarehouses = useAccessibleWarehouses();
  const availableTabs = getAvailableApplicationTabs(user, accesses);
  const defaultType = getDefaultApplicationListType(user, accesses);
  const {
    clearFilters,
    filters,
    pagination,
    queryParams,
    searchText,
    setFilter,
    setFilters,
    setSearchText,
    setType,
    type: listType,
  } = useUrlListState<ApplicationListType, ApplicationFilterKey>({
    clearOnTypeChange: true,
    defaultType,
    filterKeys: applicationFilterKeys,
    isType: isApplicationListType,
  });
  const applicationFilters = filters as ApplicationFilters;
  const appliedFilters = useMemo(
    () => getAppliedApplicationFilters(applicationFilters, accessibleWarehouses.warehouses),
    [applicationFilters, accessibleWarehouses.warehouses],
  );

  const applicationsList = useApplicationsList({
    filters: applicationFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
    type: listType,
  });

  const columns = useMemo<DataTableProps<ApplicationRecord>['columns']>(
    () => [
      {
        accessor: 'id',
        maxWidth: '90px',
        title: 'ID',
      },
      {
        accessor: 'title',
        minWidth: '260px',
        renderRowCell: (record) => record.title || '-',
        title: 'Наименование запроса',
      },
      {
        accessor: 'applicant',
        minWidth: '180px',
        renderRowCell: (record) => record.applicant || '-',
        title: 'Заявитель',
      },
      {
        accessor: 'subdivision_name',
        minWidth: '160px',
        renderRowCell: (record) => record.subdivision_name || '-',
        title: 'Здание',
      },
      {
        accessor: 'storage_name',
        minWidth: '160px',
        renderRowCell: (record) => record.storage_name || '-',
        title: 'Склад',
      },
      {
        accessor: 'reviewed_objects',
        minWidth: '170px',
        renderRowCell: (record) =>
          record.reviewed_objects
            ? `${record.reviewed_objects.count} из ${record.reviewed_objects.from}`
            : '-',
        title: 'Рассмотрено',
      },
      {
        accessor: 'date',
        minWidth: '120px',
        renderRowCell: (record) => formatDate(record.date),
        title: 'Дата',
      },
    ],
    [],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography
          element="div"
          role="heading"
          aria-level={1}
          category="heading"
          proportions="h3"
          className="text-(--color-text-primary)"
        >
          Запросы
        </Typography>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
          <SegmentedControl
            tabs={availableTabs.map((tab) => ({
              label: tab.label,
              leftIcon: tab.icon,
              value: tab.value,
            }))}
            value={listType}
            onChange={setType}
            rounded
            size="m"
            variant="accent"
          />

          {!user?.is_warehouse_manager && (
            <Button
              size="m"
              variant="primary"
              leftSection={<OutlineSystemAdd />}
              onClick={() => setIsCreateOpen(true)}
            >
              Создать
            </Button>
          )}
        </div>
      </div>

      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 gap-3">
            <Search
              className="min-w-70 flex-1"
              label="Поиск"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onClear={() => setSearchText('')}
              fullWidth
              proportions="l"
            />
            <Button
              type="button"
              variant="outline-neutral"
              size="l"
              leftSection={<OutlineSystemFilterFromLessToMore />}
              onClick={() => setIsFiltersOpen(true)}
            >
              Фильтр
            </Button>
          </div>
        </div>

        {appliedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {appliedFilters.map((filter) => (
              <Tag
                key={`${filter.key}-${filter.id}`}
                variant="primary"
                size="s"
                onClose={() =>
                  setFilter(
                    filter.key,
                    applicationFilters[filter.key].filter((id) => id !== filter.id),
                  )
                }
              >
                {filter.label}
              </Tag>
            ))}
            <Button type="button" variant="secondary" size="s" onClick={clearFilters}>
              Сбросить
            </Button>
          </div>
        )}

        <DataTable
          columns={columns}
          records={applicationsList.records}
          isFetching={applicationsList.isFetching}
          isLoading={applicationsList.isLoading}
          onRowClick={(record) => navigate(getDetailsPath(listType, record.id))}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Пока нет запросов.'
          }
          pagination={{
            ...pagination,
            totalCount: applicationsList.totalCount,
          }}
        />
      </Surface>

      {isFiltersOpen && (
        <ApplicationsFiltersModal
          filters={applicationFilters}
          isLoading={accessibleWarehouses.isLoading}
          isOpen={isFiltersOpen}
          warehouses={accessibleWarehouses.warehouses}
          onApply={setFilters}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}

      {isCreateOpen && (
        <CreateApplicationModal
          isOpen={isCreateOpen}
          warehouses={accessibleWarehouses.warehouses}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
          }}
        />
      )}
    </section>
  );
};
