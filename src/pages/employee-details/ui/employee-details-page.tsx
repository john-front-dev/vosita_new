import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Loader,
  OutlineNavigationLeftArrow,
  Surface,
  TabMenuNew,
  Typography,
} from 'alif-ui';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { EmployeeAssetTransferActions } from '@features/employee-asset-transfer';
import { type EmployeeAsset, type EmployeeAssetList, useEmployeeDetails } from '@entities/employee';
import type { MbpRecord } from '@entities/mbp';
import { routes } from '@shared/config';
import { formatMoney, getStoredUser } from '@shared/lib';
import { DataTable, type DataTableProps, StatusBanner } from '@shared/ui';

import { useResponsibleMbp } from '../model/use-responsible-mbp';
import { EmployeeDetailsSidebar } from './employee-details-sidebar';
import { type EmployeeHistoryTab, EmployeeHistoryTable } from './employee-history-table';

type EmployeeAssetTab = 'personal' | 'responsibility' | 'stock';
type EmployeeTab = EmployeeAssetTab | EmployeeHistoryTab;
type SelectableEmployeeAsset = EmployeeAsset & { selectionId: number };

const getItems = (
  employee: ReturnType<typeof useEmployeeDetails>['employee'],
  tab: EmployeeTab,
): EmployeeAssetList => {
  if (!employee) return null;
  if (tab === 'responsibility') return employee.under_responsibility_items ?? null;
  if (tab === 'stock') return employee.stock_items ?? null;
  if (tab === 'personal') return employee.personal_items ?? null;
  return null;
};

export const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedAssetRows, setSelectedAssetRows] = useState<number[]>([]);
  const { employee, isError, isLoading } = useEmployeeDetails(id, page);
  const tabs = useMemo(
    () => [
      { label: 'Личные средства', value: 'personal' },
      ...(employee?.role_id === 2 || employee?.role_id === 3
        ? [{ label: 'Под ответственностью', value: 'responsibility' }]
        : []),
      ...(employee?.role_id === 1 || employee?.role_id === 2
        ? [{ label: 'На складе сотрудника', value: 'stock' }]
        : []),
      { label: 'История ОС', value: 'fixed-asset-history' },
      ...(employee?.role_id === 1 || employee?.role_id === 2 || employee?.role_id === 3
        ? [{ label: 'История МБП', value: 'mbp-history' }]
        : []),
      { label: 'Действия пользователя', value: 'actions' },
    ],
    [employee?.role_id],
  );
  const requestedTab = searchParams.get('tab');
  const tab = (
    tabs.some((availableTab) => availableTab.value === requestedTab) ? requestedTab : 'personal'
  ) as EmployeeTab;
  const itemList = getItems(employee, tab);
  const records = itemList?.data ?? [];
  const tableRecords: SelectableEmployeeAsset[] = records.map((record, index) => ({
    ...record,
    selectionId: index,
  }));
  const responsibleMbp = useResponsibleMbp(id, page, tab === 'responsibility');
  const canTransferAssets = getStoredUser()?.access === 'редактор';
  const selectedInventoryNumbers = records
    .filter((_, index) => selectedAssetRows.includes(index))
    .map((record) => record.inventory_number)
    .filter((inventoryNumber): inventoryNumber is string => Boolean(inventoryNumber));

  useEffect(() => {
    if (isLoading || searchParams.get('tab') === tab) return;

    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.set('tab', tab);
        return nextParams;
      },
      { replace: true },
    );
  }, [isLoading, searchParams, setSearchParams, tab]);
  const columns = useMemo<DataTableProps<EmployeeAsset>['columns']>(
    () => [
      {
        accessor: 'inventory_number',
        minWidth: '180px',
        renderRowCell: (record) => record.inventory_number || '-',
        title: 'Инвентарный номер',
      },
      { accessor: 'name', minWidth: '260px', title: 'Наименование объекта' },
      {
        accessor: 'category',
        minWidth: '170px',
        renderRowCell: (record) => record.category?.name || '-',
        title: 'Категория',
      },
      {
        accessor: 'building',
        minWidth: '160px',
        renderRowCell: (record) => record.building || '-',
        title: 'Здание',
      },
      {
        accessor: 'price',
        minWidth: '150px',
        renderRowCell: (record) => formatMoney(record.price, { currency: record.currency }),
        title: 'Стоимость',
      },
    ],
    [],
  );
  const mbpColumns = useMemo<DataTableProps<MbpRecord>['columns']>(
    () => [
      {
        accessor: 'inventory_number',
        minWidth: '180px',
        renderRowCell: (record) => record.inventory_number || '-',
        title: 'Инвентарный номер',
      },
      {
        accessor: 'name',
        minWidth: '260px',
        renderRowCell: (record) => record.name || '-',
        title: 'Наименование МБП',
      },
      {
        accessor: 'status_name',
        minWidth: '180px',
        renderRowCell: (record) => record.status_name || '-',
        title: 'Статус',
      },
      {
        accessor: 'price',
        minWidth: '150px',
        renderRowCell: (record) => formatMoney(record.price, { currency: record.currency }),
        title: 'Стоимость',
      },
    ],
    [],
  );

  const header = (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline-neutral"
        size="s"
        isIconBtn
        aria-label="Вернуться к списку сотрудников"
        onClick={() => navigate(routes.employees)}
      >
        <OutlineNavigationLeftArrow />
      </Button>
      <Typography element="div" category="heading" proportions="h3" className="min-w-0 truncate">
        {employee?.full_name || 'Сотрудник'}
      </Typography>
    </div>
  );

  if (isLoading) {
    return (
      <section className="flex min-h-[calc(100vh-48px)] flex-col gap-5">
        {header}
        <Surface className="flex flex-1 items-center justify-center" p="6" rounded="12">
          <Loader />
        </Surface>
      </section>
    );
  }

  if (isError || !employee || !id) {
    return (
      <section className="flex min-h-[calc(100vh-48px)] flex-col gap-5">
        {header}
        <Surface className="flex flex-1 items-center justify-center" p="6" rounded="12">
          <Typography category="heading" proportions="h3">
            Сотрудник не найден
          </Typography>
        </Surface>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-col gap-5 pb-10">
      {header}
      <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <main className="flex min-w-0 flex-col gap-5">
          <StatusBanner
            label={employee.active ? 'Активный' : 'Неактивный'}
            tone={employee.active ? 'green' : 'red'}
          />
          <TabMenuNew
            tabs={tabs}
            value={tab}
            justify="center"
            onChange={(value) => {
              setSearchParams(
                (currentParams) => {
                  const nextParams = new URLSearchParams(currentParams);
                  nextParams.set('tab', value);
                  return nextParams;
                },
                { replace: true },
              );
              setPage(1);
              setIsSelecting(false);
              setSelectedAssetRows([]);
            }}
          />
          <Surface p="6" rounded="12">
            {tab === 'personal' || tab === 'responsibility' || tab === 'stock' ? (
              <div className="flex flex-col gap-4">
                {tab === 'responsibility' && canTransferAssets && records.length > 0 && (
                  <EmployeeAssetTransferActions
                    employeeId={employee.id}
                    inventoryNumbers={selectedInventoryNumbers}
                    isSelecting={isSelecting}
                    onSelectToggle={() => {
                      setIsSelecting((current) => !current);
                      setSelectedAssetRows([]);
                    }}
                    onSuccess={() => {
                      setIsSelecting(false);
                      setSelectedAssetRows([]);
                    }}
                  />
                )}
                <DataTable
                  columns={columns}
                  records={tableRecords}
                  accessorId="selectionId"
                  isLoading={isLoading}
                  emptyPlaceholder="У сотрудника нет объектов в этом разделе."
                  tableClassNames={{
                    root: tab === 'responsibility' && records.length === 0 ? 'hidden' : undefined,
                  }}
                  selectedRecords={isSelecting ? selectedAssetRows : undefined}
                  onSelectedRecordsChange={isSelecting ? setSelectedAssetRows : undefined}
                  onRowClick={(record) => {
                    if (isSelecting) {
                      setSelectedAssetRows((current) =>
                        current.includes(record.selectionId)
                          ? current.filter((rowId) => rowId !== record.selectionId)
                          : [...current, record.selectionId],
                      );
                      return;
                    }

                    navigate(routes.fixedAssetsDetails.replace(':id', String(record.id)));
                  }}
                  pagination={{
                    currentPage: page,
                    onPageChange: (nextPage) => {
                      setPage(nextPage);
                      setSelectedAssetRows([]);
                    },
                    pageSize: 10,
                    totalCount: Math.max(
                      itemList?.total_count ?? (itemList?.total_pages ?? 0) * 10,
                      tab === 'responsibility' ? responsibleMbp.totalCount : 0,
                    ),
                  }}
                >
                  {tab === 'responsibility' &&
                    (responsibleMbp.isLoading || responsibleMbp.records.length > 0) && (
                      <div className={`${records.length > 0 ? 'mt-6' : ''}flex flex-col gap-3`}>
                        <Typography category="body" proportions="mStrong">
                          МБП под ответственностью
                        </Typography>
                        <DataTable
                          columns={mbpColumns}
                          records={responsibleMbp.records}
                          isFetching={responsibleMbp.isFetching}
                          isLoading={responsibleMbp.isLoading}
                          onRowClick={(record) =>
                            navigate(routes.mbpDetails.replace(':id', String(record.id)))
                          }
                          emptyPlaceholder="У сотрудника нет МБП под ответственностью."
                        />
                      </div>
                    )}
                </DataTable>
              </div>
            ) : (
              <EmployeeHistoryTable employeeId={id} tab={tab} />
            )}
          </Surface>
        </main>
        <aside className="h-fit xl:sticky xl:top-6">
          <EmployeeDetailsSidebar
            key={`${employee.active}-${employee.role_id}-${employee.access}-${employee.consumables?.map((item) => `${item.id}:${item.accept}`).join(',')}`}
            employee={employee}
          />
        </aside>
      </div>
    </section>
  );
};
