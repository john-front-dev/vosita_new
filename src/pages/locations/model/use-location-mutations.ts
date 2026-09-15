import { snackbar } from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';

import { locationsEndpoints } from '../api/locations-api';
import type { LocationFormValues, LocationRecord, LocationType } from './types';

type LocationMutationVariables = { body: Record<string, unknown>; url: string };

const getEndpoint = (type: LocationType, record: LocationRecord | null) => {
  if (!record) {
    return {
      cities: locationsEndpoints.createCity,
      buildings: locationsEndpoints.createBuilding,
      cabinets: locationsEndpoints.createCabinet,
      warehouses: locationsEndpoints.createWarehouse,
    }[type];
  }
  return {
    cities: locationsEndpoints.editCity,
    buildings: locationsEndpoints.editBuilding,
    cabinets: locationsEndpoints.editCabinet,
    warehouses: locationsEndpoints.editWarehouse,
  }[type](record.id);
};

const getBody = (type: LocationType, values: LocationFormValues, isEdit: boolean) => {
  if (type === 'cities') return { region: values.name.trim() };
  if (type === 'buildings') {
    return {
      crm_id: values.crmId.trim(),
      end_date: new Date(values.endDate).toISOString(),
      filial_id: Number(values.cityId),
      name: values.name.trim(),
      responsible: values.responsibleText.trim(),
      start_date: new Date(values.startDate).toISOString(),
    };
  }
  if (type === 'cabinets') {
    return {
      department_id: Number(values.cityId),
      name_room: values.name.trim(),
      subdivision_id: Number(values.buildingId),
      ...(!isEdit && values.responsibleId ? { responsible_id: values.responsibleId } : {}),
    };
  }
  if (isEdit) return { name: values.name.trim(), responsible_id: values.responsibleId };
  return {
    department_id: Number(values.cityId),
    name: values.name.trim(),
    responsible_id: values.responsibleId || undefined,
    storage_type_id: Number(values.storageTypeId),
    subdivision_id: Number(values.buildingId),
  };
};

export const useSaveLocation = (
  type: LocationType,
  record: LocationRecord | null,
  onSuccess: () => void,
) => {
  const endpoint = getEndpoint(type, record);
  const isEdit = record !== null;
  const options = {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['locations-list', type] });
      snackbar.show({
        title: isEdit ? 'Изменения сохранены' : 'Местоположение добавлено',
        type: 'success' as const,
      });
      onSuccess();
    },
  };
  const { isPending: isPosting, mutate: postLocation } = useMutationQuery<ApiResponse<unknown>, LocationMutationVariables>({
    method: 'post',
    url: endpoint,
    options,
  });
  const { isPending: isPutting, mutate: putLocation } = useMutationQuery<ApiResponse<unknown>, LocationMutationVariables>({
    method: 'put',
    url: endpoint,
    options,
  });

  return {
    isSaving: isPosting || isPutting,
    save: (values: LocationFormValues) => {
      const variables = { body: getBody(type, values, isEdit), url: endpoint };
      if (isEdit && (type === 'cabinets' || type === 'warehouses')) {
        putLocation(variables);
      } else {
        postLocation(variables);
      }
    },
  };
};

export const useRemoveLocation = (type: LocationType, onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: '',
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['locations-list', type] });
        snackbar.show({ title: 'Местоположение удалено', type: 'success' });
        onSuccess();
      },
    },
  });
  return {
    isRemoving: isPending,
    remove: (id: number) => {
      const url = type === 'cities'
        ? locationsEndpoints.removeCity(id)
        : type === 'buildings'
          ? locationsEndpoints.removeBuilding(id)
          : locationsEndpoints.removeCabinet(id);
      mutate({ url });
    },
  };
};
