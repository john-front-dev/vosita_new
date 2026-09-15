import { useMemo, useState } from 'react';
import { Badge } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import {
  type EmployeeFixedAssetHistory,
  type EmployeeMbpHistory,
  type EmployeeUserAction,
  useEmployeeFixedAssetHistory,
  useEmployeeMbpHistory,
  useEmployeeUserActions,
} from '@entities/employee';
import { routes } from '@shared/config';
import { formatDate } from '@shared/lib';
import { DataTable, type DataTableProps } from '@shared/ui';

import { EmployeeActionDetailsModal } from './employee-action-details-modal';

export type EmployeeHistoryTab = 'actions' | 'fixed-asset-history' | 'mbp-history';

type EmployeeHistoryTableProps = {
  employeeId: string;
  tab: EmployeeHistoryTab;
};

export const EmployeeHistoryTable = ({ employeeId, tab }: EmployeeHistoryTableProps) => {
  const navigate = useNavigate();
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);
  const {
    isFetching: isFixedAssetsFetching,
    isLoading: isFixedAssetsLoading,
    records: fixedAssetRecords,
  } = useEmployeeFixedAssetHistory(employeeId, tab === 'fixed-asset-history');
  const {
    isFetching: isMbpFetching,
    isLoading: isMbpLoading,
    records: mbpRecords,
  } = useEmployeeMbpHistory(employeeId, tab === 'mbp-history');
  const {
    isFetching: isActionsFetching,
    isLoading: isActionsLoading,
    records: actionRecords,
  } = useEmployeeUserActions(employeeId, tab === 'actions');

  const fixedAssetColumns = useMemo<DataTableProps<EmployeeFixedAssetHistory>['columns']>(
    () => [
      { accessor: 'inventory_number', minWidth: '220px', title: 'Инвентарный номер' },
      { accessor: 'warehouse_name', minWidth: '250px', title: 'Название ОС' },
      { accessor: 'old_employee_name', minWidth: '220px', title: 'Предыдущий сотрудник' },
      {
        accessor: 'history_date',
        minWidth: '150px',
        renderRowCell: (record) => formatDate(record.history_date),
        title: 'Дата операции',
      },
    ],
    [],
  );
  const mbpColumns = useMemo<DataTableProps<EmployeeMbpHistory>['columns']>(
    () => [
      { accessor: 'mbp_item_name', minWidth: '260px', title: 'Название МБП' },
      { accessor: 'old_employee_name', minWidth: '220px', title: 'Предыдущий сотрудник' },
      { accessor: 'new_employee_name', minWidth: '220px', title: 'Новый сотрудник' },
      {
        accessor: 'created_at',
        minWidth: '150px',
        renderRowCell: (record) => formatDate(record.created_at),
        title: 'Дата операции',
      },
    ],
    [],
  );
  const actionColumns = useMemo<DataTableProps<EmployeeUserAction>['columns']>(
    () => [
      { accessor: 'inventory_number', minWidth: '180px', title: 'Инвентарный номер' },
      { accessor: 'warehouse_name', minWidth: '230px', title: 'Название ОС' },
      {
        accessor: 'operation_name',
        minWidth: '240px',
        renderRowCell: (record) => (
          <Badge className="whitespace-nowrap" size="m" type="secondary" variant="info">
            {record.operation_name || '-'}
          </Badge>
        ),
        title: 'Тип операции',
      },
      { accessor: 'old_employee_name', minWidth: '210px', title: 'Предыдущий сотрудник' },
      {
        accessor: 'new_employee_name',
        minWidth: '210px',
        renderRowCell: (record) => record.new_employee_name || 'Не назначен',
        title: 'Новый сотрудник',
      },
      {
        accessor: 'created_at',
        minWidth: '150px',
        renderRowCell: (record) => formatDate(record.created_at),
        title: 'Дата операции',
      },
    ],
    [],
  );

  if (tab === 'fixed-asset-history') {
    return (
      <DataTable
        columns={fixedAssetColumns}
        records={fixedAssetRecords}
        isLoading={isFixedAssetsLoading || isFixedAssetsFetching}
        emptyPlaceholder="История операций ОС отсутствует."
        onRowClick={(record) =>
          navigate(routes.fixedAssetsDetails.replace(':id', String(record.warehouse_id)))
        }
      />
    );
  }

  if (tab === 'mbp-history') {
    return (
      <DataTable
        columns={mbpColumns}
        records={mbpRecords}
        isLoading={isMbpLoading || isMbpFetching}
        emptyPlaceholder="История операций МБП отсутствует."
      />
    );
  }

  return (
    <>
      <DataTable
        columns={actionColumns}
        records={actionRecords}
        isLoading={isActionsLoading || isActionsFetching}
        emptyPlaceholder="Нет данных об операциях пользователя."
        onRowClick={(record) => setSelectedActionId(record.id)}
      />
      {selectedActionId !== null && (
        <EmployeeActionDetailsModal
          actionId={selectedActionId}
          onClose={() => setSelectedActionId(null)}
        />
      )}
    </>
  );
};
