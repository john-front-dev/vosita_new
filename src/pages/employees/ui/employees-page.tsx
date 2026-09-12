import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  OutlineSystemRefresh,
  OutlineSystemUserAdd,
  Search,
  snackbar,
  Surface,
  Typography,
} from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import type { Employee } from '@entities/employee';
import { useMutationQuery } from '@shared/api';
import { routes } from '@shared/config';
import { getStoredUser, useUrlListState } from '@shared/lib';
import { DataTable, type DataTableProps } from '@shared/ui';

import { employeesEndpoints } from '../api/employees-api';
import {
  employeesDefaultFilters,
  type EmployeesFilterKey,
  employeesFilterKeys,
  type EmployeesFilters as EmployeesFilterValues,
} from '../model/employees-filters';
import { useEmployeesList } from '../model/use-employees-list';
import { AddEmployeeModal } from './add-employee-modal';
import { EmployeesFilters } from './employees-filters';

const yesNoBadge = (value: boolean) => (
  <Badge size="m" type="secondary" variant={value ? 'info' : 'neutral'}>
    {value ? 'Да' : 'Нет'}
  </Badge>
);

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const canManage = getStoredUser()?.access === 'редактор';
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { filters, pagination, queryParams, searchParams, searchText, setFilters, setSearchText } =
    useUrlListState<string, EmployeesFilterKey>({ filterKeys: employeesFilterKeys });
  const hasStoredFilters = employeesFilterKeys.some((key) => searchParams.has(key));
  const employeeFilters = (
    hasStoredFilters ? filters : employeesDefaultFilters
  ) as EmployeesFilterValues;
  const list = useEmployeesList({
    filters: employeeFilters,
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
  });
  const refreshEmployees = useMutationQuery<ApiResponse<unknown>>({
    method: 'post',
    url: employeesEndpoints.refresh,
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Список сотрудников обновлён', type: 'success' });
        void list.refetch();
      },
      onError: () => snackbar.show({ title: 'Не удалось обновить список', type: 'error' }),
    },
  });
  const columns = useMemo<DataTableProps<Employee>['columns']>(
    () => [
      { accessor: 'user_id', minWidth: '130px', title: 'HR ID' },
      { accessor: 'full_name', minWidth: '280px', title: 'Ф.И.О.' },
      {
        accessor: 'active',
        minWidth: '150px',
        renderRowCell: (record) => (
          <Badge size="m" type="secondary" variant={record.active ? 'success' : 'error'}>
            {record.active ? 'Активный' : 'Неактивный'}
          </Badge>
        ),
        title: 'Статус',
      },
      {
        accessor: 'warehouse_manager',
        minWidth: '190px',
        renderRowCell: (record) => yesNoBadge(record.role_id === 1 || record.role_id === 2),
        title: 'Заведующий складом',
      },
      {
        accessor: 'responsible_person',
        minWidth: '180px',
        renderRowCell: (record) => yesNoBadge(record.role_id === 2 || record.role_id === 3),
        title: 'Ответственное лицо',
      },
      {
        accessor: 'access',
        minWidth: '210px',
        renderRowCell: (record) => (record.role_id === 4 ? 'Нет доступа' : record.access || '-'),
        title: 'Доступ администратора',
      },
    ],
    [],
  );

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          Сотрудники
        </Typography>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="l"
            variant="outline-neutral"
            isIconBtn
            aria-label="Обновить сотрудников"
            isLoading={refreshEmployees.isPending}
            onClick={() => refreshEmployees.mutate({})}
          >
            <OutlineSystemRefresh />
          </Button>
          {canManage && (
            <Button
              type="button"
              size="l"
              variant="primary"
              leftSection={<OutlineSystemUserAdd />}
              onClick={() => setIsAddOpen(true)}
            >
              Добавить сотрудника
            </Button>
          )}
        </div>
      </div>
      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <div className="flex min-w-0 flex-wrap gap-3">
          <Search
            className="min-w-70 flex-1"
            label="Поиск"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onClear={() => setSearchText('')}
            fullWidth
            proportions="l"
          />
          <EmployeesFilters
            filters={employeeFilters}
            isOpen={isFiltersOpen}
            onClick={() => setIsFiltersOpen(true)}
            onApply={(next) => {
              setFilters(next);
              setIsFiltersOpen(false);
            }}
            onClose={() => setIsFiltersOpen(false)}
          />
        </div>
        <DataTable
          columns={columns}
          records={list.records}
          isFetching={list.isFetching}
          isLoading={list.isLoading}
          onRowClick={(record) =>
            navigate(routes.employeeDetails.replace(':id', String(record.id)))
          }
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску "${queryParams.searchText}" ничего не найдено.`
              : 'Список сотрудников пока пуст.'
          }
          pagination={{ ...pagination, totalCount: list.totalCount }}
        />
      </Surface>
      {isAddOpen && (
        <AddEmployeeModal
          isOpen
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => void list.refetch()}
        />
      )}
    </section>
  );
};
