import { useMemo, useState } from 'react';
import { Button, Checkbox, Surface, Switch, Typography } from 'alif-ui';

import {
  employeeAccessOptions,
  type EmployeeDetails,
  employeeEndpoints,
  employeeRoleOptions,
  type EmployeeWarehouseAccessResponse,
} from '@entities/employee';
import { useGetQuery } from '@shared/api';
import { getStoredAccesses, getStoredUser, isAccountant } from '@shared/lib';
import { DetailsGroup, DetailsRow } from '@shared/ui';

import {
  changeWarehouseAccessRole,
  getInitialWarehouseAccesses,
  isWarehouseAccessComplete,
  supportsWarehouseAccess,
} from '../model/employee-permission-utils';
import { useEmployeeDetailsMutations } from '../model/use-employee-details-mutations';
import { EmployeeWarehouseAccessSettings } from './employee-warehouse-access-settings';

type EmployeeDetailsSidebarProps = { employee: EmployeeDetails };

export const EmployeeDetailsSidebar = ({ employee }: EmployeeDetailsSidebarProps) => {
  const {
    access,
    active: initialActive,
    consumables: initialConsumables = [],
    email,
    full_name: fullName,
    id,
    manual,
    role_id: initialRoleId = 0,
  } = employee;
  const canManage = getStoredUser()?.access === 'редактор';
  const isCurrentUserAccountant = isAccountant(getStoredAccesses());
  const canEditPermissions = canManage && !isCurrentUserAccountant;
  const [roleId, setRoleId] = useState(initialRoleId);
  const [accessId, setAccessId] = useState(
    employeeAccessOptions.find((option) => option.label.toLowerCase() === access)?.value ?? '',
  );
  const [active, setActive] = useState(Boolean(initialActive));
  const [consumables, setConsumables] = useState(initialConsumables);
  const [changedConsumableIds, setChangedConsumableIds] = useState<number[]>([]);
  const {
    data: warehouseAccessData,
    dataUpdatedAt: warehouseAccessUpdatedAt,
    isError: isWarehouseAccessError,
    isFetching: isWarehouseAccessFetching,
    isLoading: isWarehouseAccessLoading,
  } = useGetQuery<EmployeeWarehouseAccessResponse>({
    queryKey: ['employee-warehouse-access', id],
    url: employeeEndpoints.warehouseAccessDetails(id),
    options: { enabled: canEditPermissions },
  });
  const serverWarehouseAccesses = useMemo(
    () =>
      getInitialWarehouseAccesses(initialRoleId, warehouseAccessData?.payload.employee_permissions),
    [initialRoleId, warehouseAccessData],
  );
  const [warehouseAccessDraft, setWarehouseAccessDraft] = useState({
    accesses: serverWarehouseAccesses,
    sourceUpdatedAt: warehouseAccessUpdatedAt,
  });
  const { accesses: warehouseAccesses, sourceUpdatedAt } = warehouseAccessDraft;

  if (sourceUpdatedAt !== warehouseAccessUpdatedAt) {
    setWarehouseAccessDraft({
      accesses: serverWarehouseAccesses,
      sourceUpdatedAt: warehouseAccessUpdatedAt,
    });
  }

  const {
    isSavingConsumables,
    isSavingSettings,
    isTogglingStatus,
    saveConsumables,
    saveSettings,
    toggleStatus: updateStatus,
  } = useEmployeeDetailsMutations(employee, () => setChangedConsumableIds([]));

  const toggleStatus = (nextActive: boolean) => {
    setActive(nextActive);
    updateStatus(nextActive, () => setActive(!nextActive));
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
    const nextRole = Number(nextRoleId);
    setRoleId(nextRole);
    setWarehouseAccessDraft((current) => ({
      ...current,
      accesses: changeWarehouseAccessRole(nextRole, current.accesses),
    }));
  };
  const roleSupportsWarehouseAccess = supportsWarehouseAccess(roleId);
  const isWarehouseAccessUnavailable =
    roleSupportsWarehouseAccess &&
    (isWarehouseAccessLoading || isWarehouseAccessFetching || isWarehouseAccessError);
  const hasIncompleteWarehouseAccess = !isWarehouseAccessComplete(roleId, warehouseAccesses);

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
              {fullName || '-'}
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
              {email || '-'}
            </Typography>
          </div>
        </div>

        {manual && canManage && (
          <div className="flex items-center justify-between gap-3">
            <Typography category="body" proportions="sStrong">
              Статус
            </Typography>
            <Switch
              label={active ? 'Активный' : 'Неактивный'}
              checked={active}
              disabled={isTogglingStatus}
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
                  checked={roleId === Number(option.value)}
                  disabled={!active}
                  onChange={() => changeRole(option.value)}
                />
              ))}
            </div>
            {roleId === 3 && (
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
                accesses={warehouseAccesses}
                disabled={!active || isWarehouseAccessLoading}
                isStorageTypeLocked={roleId === 7}
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
                (roleId === 3 && !accessId) ||
                isWarehouseAccessUnavailable ||
                hasIncompleteWarehouseAccess
              }
              isLoading={isSavingSettings}
              onClick={() =>
                void saveSettings(
                  roleId,
                  Number(accessId || 2),
                  roleSupportsWarehouseAccess ? warehouseAccesses : null,
                )
              }
            >
              Сохранить
            </Button>
          </>
        ) : (
          <DetailsGroup title="Права">
            <DetailsRow
              label="Роль"
              value={
                employeeRoleOptions.find((option) => Number(option.value) === initialRoleId)
                  ?.label
              }
            />
            <DetailsRow
              label="Доступ администратора"
              value={initialRoleId === 4 ? 'Нет доступа' : access}
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
              isLoading={isSavingConsumables}
              onClick={() =>
                saveConsumables(
                  consumables.filter((item) => changedConsumableIds.includes(item.id)),
                )
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
