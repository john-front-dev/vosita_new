import { snackbar } from 'alif-ui';

import {
  type EmployeeDetails,
  employeeEndpoints,
  type EmployeeLocationAccess,
} from '@entities/employee';
import { queryClient, useMutationQuery } from '@shared/api';

type Consumable = { accept: boolean; id: number; title: string };

export const useEmployeeDetailsMutations = (
  employee: EmployeeDetails,
  onConsumablesSaved: () => void,
) => {
  const userId = employee.user_id ?? employee.id;
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['employee-details', String(employee.id)] });
  const { isPending: isEditing, mutateAsync: editEmployee } = useMutationQuery<
    ApiResponse<unknown>,
    { body: { access_id: number; role_id: number } }
  >({ method: 'post', url: employeeEndpoints.edit(userId) });
  const { isPending: isSavingAccess, mutateAsync: saveAccess } = useMutationQuery<
    ApiResponse<unknown>,
    { body: { location_access: EmployeeLocationAccess[]; user_id: string } }
  >({ method: 'post', url: employeeEndpoints.warehouseAccess });
  const { isPending: isDeactivating, mutate: deactivate } = useMutationQuery<ApiResponse<unknown>>({
    method: 'delete',
    url: employeeEndpoints.deactivate(employee.id),
    options: { onSuccess: () => void refresh() },
  });
  const { isPending: isReactivating, mutate: reactivate } = useMutationQuery<ApiResponse<unknown>>({
    method: 'post',
    url: employeeEndpoints.reactivate(employee.id),
    options: { onSuccess: () => void refresh() },
  });
  const { isPending: isSavingConsumables, mutate: saveConsumables } = useMutationQuery<ApiResponse<unknown>, { body: Consumable[] }>({
    method: 'post',
    url: employeeEndpoints.consumables(userId),
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Настройки расходников сохранены', type: 'success' });
        onConsumablesSaved();
        void refresh();
      },
      onError: () => snackbar.show({ title: 'Не удалось сохранить расходники', type: 'error' }),
    },
  });

  const saveSettings = async (
    roleId: number,
    accessId: number,
    accesses: EmployeeLocationAccess[] | null,
  ) => {
    try {
      await editEmployee({ body: { access_id: accessId, role_id: roleId } });
      if (accesses) {
        await saveAccess({
          body: { location_access: accesses, user_id: String(employee.id) },
        });
      }
      snackbar.show({ title: 'Настройки сотрудника сохранены', type: 'success' });
      void refresh();
    } catch {
      snackbar.show({ title: 'Не удалось сохранить настройки', type: 'error' });
    }
  };

  return {
    isSavingConsumables,
    isSavingSettings: isEditing || isSavingAccess,
    isTogglingStatus: isDeactivating || isReactivating,
    saveConsumables: (consumables: Consumable[]) => saveConsumables({ body: consumables }),
    saveSettings,
    toggleStatus: (active: boolean, onError: () => void) => {
      const toggle = active ? reactivate : deactivate;
      toggle({}, { onError });
    },
  };
};
