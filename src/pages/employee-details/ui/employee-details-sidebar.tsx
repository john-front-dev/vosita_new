import { useMemo, useState } from 'react';
import { Button, Checkbox, snackbar, Surface, Switch, Typography } from 'alif-ui';

import {
  employeeAccessOptions,
  type EmployeeDetails,
  employeeEndpoints,
  type EmployeeLocationAccess,
  employeeRoleOptions,
  type EmployeeWarehouseAccessResponse,
} from '@entities/employee';
import { queryClient, useGetQuery, useMutationQuery } from '@shared/api';
import { getStoredAccesses, getStoredUser } from '@shared/lib';
import { DetailsGroup, DetailsRow } from '@shared/ui';

import { EmployeeWarehouseAccessSettings } from './employee-warehouse-access-settings';

type EmployeeDetailsSidebarProps = { employee: EmployeeDetails };

export const EmployeeDetailsSidebar = ({ employee }: EmployeeDetailsSidebarProps) => {
  const canManage = getStoredUser()?.access === 'редактор';
  const isCurrentUserAccountant = getStoredAccesses()[0]?.storage_type === 'Accountant';
  const canEditPermissions = canManage && !isCurrentUserAccountant;
  const [roleId, setRoleId] = useState(String(employee.role_id ?? ''));
  const [accessId, setAccessId] = useState(
    employeeAccessOptions.find((option) => option.label.toLowerCase() === employee.access)?.value ??
      '',
  );
  const [active, setActive] = useState(Boolean(employee.active));
  const [consumables, setConsumables] = useState(employee.consumables ?? []);
  const [changedConsumableIds, setChangedConsumableIds] = useState<number[]>([]);
  const warehouseAccessQuery = useGetQuery<EmployeeWarehouseAccessResponse>({
    queryKey: ['employee-warehouse-access', employee.id],
    url: employeeEndpoints.warehouseAccessDetails(employee.id),
    options: { enabled: canEditPermissions },
  });
  const serverWarehouseAccesses = useMemo(() => {
    const accesses = (warehouseAccessQuery.data?.payload.employee_permissions ?? []).map(
      (permission) => ({
        storage_type: permission.storage_type,
        storages_ids: permission.storages.map((storage) => storage.id),
      }),
    );

    if (employee.role_id !== 7)
      return accesses.filter((access) => access.storage_type !== 'Accountant');

    const accountantAccess = accesses.find((access) => access.storage_type === 'Accountant');
    return [{ storage_type: 'Accountant', storages_ids: accountantAccess?.storages_ids ?? [] }];
  }, [employee.role_id, warehouseAccessQuery.data]);
  const [warehouseAccessDraft, setWarehouseAccessDraft] = useState<{
    accesses: EmployeeLocationAccess[];
    sourceUpdatedAt: number;
  }>({ accesses: [], sourceUpdatedAt: -1 });

  if (warehouseAccessDraft.sourceUpdatedAt !== warehouseAccessQuery.dataUpdatedAt) {
    setWarehouseAccessDraft({
      accesses: serverWarehouseAccesses,
      sourceUpdatedAt: warehouseAccessQuery.dataUpdatedAt,
    });
  }

  const refreshEmployee = () =>
    queryClient.invalidateQueries({ queryKey: ['employee-details', String(employee.id)] });

  const editEmployee = useMutationQuery<
    ApiResponse<unknown>,
    { body: { access_id: number; role_id: number } }
  >({
    method: 'post',
    url: employeeEndpoints.edit(employee.user_id ?? ''),
  });
  const saveWarehouseAccess = useMutationQuery<
    ApiResponse<unknown>,
    { body: { location_access: EmployeeLocationAccess[]; user_id: string } }
  >({ method: 'post', url: employeeEndpoints.warehouseAccess });
  const deactivateEmployee = useMutationQuery<ApiResponse<unknown>>({
    method: 'delete',
    url: employeeEndpoints.deactivate(employee.id),
    options: { onSuccess: () => void refreshEmployee() },
  });
  const reactivateEmployee = useMutationQuery<ApiResponse<unknown>>({
    method: 'post',
    url: employeeEndpoints.reactivate(employee.id),
    options: { onSuccess: () => void refreshEmployee() },
  });
  const saveConsumables = useMutationQuery<
    ApiResponse<unknown>,
    { body: Array<{ accept: boolean; id: number; title: string }> }
  >({
    method: 'post',
    url: employeeEndpoints.consumables(employee.user_id ?? ''),
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Настройки расходников сохранены', type: 'success' });
        setChangedConsumableIds([]);
        void refreshEmployee();
      },
      onError: () => snackbar.show({ title: 'Не удалось сохранить расходники', type: 'error' }),
    },
  });

  const toggleStatus = (nextActive: boolean) => {
    setActive(nextActive);
    const mutation = nextActive ? reactivateEmployee : deactivateEmployee;
    mutation.mutate({}, { onError: () => setActive(!nextActive) });
  };
  const toggleConsumable = (id: number) => {
    setConsumables((current) =>
      current.map((item) => (item.id === id ? { ...item, accept: !item.accept } : item)),
    );
    setChangedConsumableIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  };
  const changeRole = (nextRoleId: string) => {
    setRoleId(nextRoleId);
    setWarehouseAccessDraft((current) => {
      if (nextRoleId === '7') {
        const accountantAccess = current.accesses.find(
          (access) => access.storage_type === 'Accountant',
        );
        return {
          ...current,
          accesses: [
            { storage_type: 'Accountant', storages_ids: accountantAccess?.storages_ids ?? [] },
          ],
        };
      }

      return {
        ...current,
        accesses: current.accesses.filter((access) => access.storage_type !== 'Accountant'),
      };
    });
  };
  const roleSupportsWarehouseAccess = ['1', '2', '3', '7'].includes(roleId);
  const isWarehouseAccessUnavailable =
    roleSupportsWarehouseAccess &&
    (warehouseAccessQuery.isLoading ||
      warehouseAccessQuery.isFetching ||
      warehouseAccessQuery.isError);
  const hasIncompleteWarehouseAccess =
    roleId === '7'
      ? warehouseAccessDraft.accesses.length !== 1 ||
        warehouseAccessDraft.accesses[0]?.storage_type !== 'Accountant' ||
        !warehouseAccessDraft.accesses[0].storages_ids.length
      : roleSupportsWarehouseAccess &&
        warehouseAccessDraft.accesses.some((access) => !access.storages_ids.length);

  const saveEmployeeSettings = async () => {
    try {
      const editResponse = await editEmployee.mutateAsync({
        body: { role_id: Number(roleId), access_id: Number(accessId || 2) },
      });
      if (editResponse.code !== 200) throw new Error(editResponse.message);

      if (roleSupportsWarehouseAccess) {
        const accessResponse = await saveWarehouseAccess.mutateAsync({
          body: {
            user_id: String(employee.id),
            location_access: warehouseAccessDraft.accesses,
          },
        });
        if (accessResponse.code !== 200) throw new Error(accessResponse.message);
      }

      snackbar.show({ title: 'Настройки сотрудника сохранены', type: 'success' });
      void refreshEmployee();
    } catch {
      snackbar.show({ title: 'Не удалось сохранить настройки', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Surface className="flex flex-col gap-5" p="6" rounded="12">
        <div className="flex flex-col gap-4">
          <div>
            <Typography
              element="div"
              category="body"
              proportions="sStrong"
              className="text-(--color-text-secondary)"
            >
              Ф.И.О
            </Typography>
            <Typography
              element="div"
              category="body"
              proportions="s"
              className="mt-1 wrap-anywhere text-(--color-text-primary)"
            >
              {employee.full_name || '-'}
            </Typography>
          </div>
          <div>
            <Typography
              element="div"
              category="body"
              proportions="sStrong"
              className="text-(--color-text-secondary)"
            >
              Эл.почта
            </Typography>
            <Typography
              element="div"
              category="body"
              proportions="s"
              className="mt-1 wrap-anywhere text-(--color-text-primary)"
            >
              {employee.email || '-'}
            </Typography>
          </div>
        </div>

        {employee.manual && canManage && (
          <div className="flex items-center justify-between gap-3">
            <Typography category="body" proportions="sStrong">
              Статус
            </Typography>
            <Switch
              label={active ? 'Активный' : 'Неактивный'}
              checked={active}
              disabled={deactivateEmployee.isPending || reactivateEmployee.isPending}
              onChange={(event) => toggleStatus(event.target.checked)}
            />
          </div>
        )}

        {canEditPermissions ? (
          <>
            <div className="flex flex-col gap-3">
              <Typography category="body" proportions="mStrong">
                Роль
              </Typography>
              {employeeRoleOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={roleId === option.value}
                  disabled={!active}
                  onChange={() => changeRole(option.value)}
                />
              ))}
            </div>
            {roleId === '3' && (
              <div className="flex flex-col gap-3">
                <Typography category="body" proportions="mStrong">
                  Доступ администратора
                </Typography>
                {employeeAccessOptions.map((option) => (
                  <Checkbox
                    key={option.value}
                    label={option.label}
                    checked={accessId === option.value}
                    disabled={!active}
                    onChange={() => setAccessId(option.value)}
                  />
                ))}
              </div>
            )}
            {roleSupportsWarehouseAccess && (
              <EmployeeWarehouseAccessSettings
                accesses={warehouseAccessDraft.accesses}
                disabled={!active || warehouseAccessQuery.isLoading}
                isStorageTypeLocked={roleId === '7'}
                onChange={(accesses) =>
                  setWarehouseAccessDraft((current) => ({ ...current, accesses }))
                }
              />
            )}
            <Button
              type="button"
              variant="primary"
              disabled={
                !active ||
                !roleId ||
                (roleId === '3' && !accessId) ||
                isWarehouseAccessUnavailable ||
                hasIncompleteWarehouseAccess
              }
              isLoading={editEmployee.isPending || saveWarehouseAccess.isPending}
              onClick={() => void saveEmployeeSettings()}
            >
              Сохранить
            </Button>
          </>
        ) : (
          <DetailsGroup title="Права">
            <DetailsRow
              label="Роль"
              value={
                employeeRoleOptions.find((option) => Number(option.value) === employee.role_id)
                  ?.label
              }
            />
            <DetailsRow
              label="Доступ администратора"
              value={employee.role_id === 4 ? 'Нет доступа' : employee.access}
            />
          </DetailsGroup>
        )}
      </Surface>

      {consumables.length > 0 && (
        <Surface className="flex flex-col gap-4" p="6" rounded="12">
          <Typography category="body" proportions="mStrong">
            Расходники
          </Typography>
          {consumables.map((item) => (
            <Checkbox
              key={item.id}
              label={item.title}
              checked={item.accept}
              disabled={!canManage || !active}
              onChange={() => toggleConsumable(item.id)}
            />
          ))}
          {canManage && (
            <Button
              type="button"
              variant="primary"
              disabled={!active || !changedConsumableIds.length}
              isLoading={saveConsumables.isPending}
              onClick={() =>
                saveConsumables.mutate({
                  body: consumables.filter((item) => changedConsumableIds.includes(item.id)),
                })
              }
            >
              Сохранить
            </Button>
          )}
        </Surface>
      )}
    </div>
  );
};
