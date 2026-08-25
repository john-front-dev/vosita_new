import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, Select, snackbar, TextArea } from 'alif-ui';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';

import { applicationEndpoints } from '@entities/application';
import {
  type AccessibleWarehouse,
  buildDepartmentOptions,
  buildStorageOptions,
  buildSubdivisionOptions,
} from '@entities/location';
import { useMutationQuery } from '@shared/api';
import { getStoredAccesses, getStoredUser } from '@shared/lib';

import { createApplicationOptions } from '../model/create-application-options';
import {
  createApplicationDefaultValues,
  type CreateApplicationFormValues,
  createApplicationSchema,
} from '../model/create-application-validation';
import type { CreateApplicationRequest } from '../model/types';

type CreateApplicationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouses: AccessibleWarehouse[];
};

const isSelectObject = (value: unknown): value is { value: string | number } =>
  typeof value === 'object' && value !== null && 'value' in value;

const normalizeSelectValue = (value: unknown) => {
  if (isSelectObject(value)) {
    return String(value.value);
  }

  return value ? String(value) : '';
};

export const CreateApplicationModal = ({
  isOpen,
  onClose,
  onSuccess,
  warehouses,
}: CreateApplicationModalProps) => {
  const user = getStoredUser();
  const accesses = getStoredAccesses();
  const isAccountant = accesses[0]?.storage_type === 'Accountant';
  const hasFullAccess = Boolean(user?.is_responsible_person && !user.is_warehouse_manager);

  const categoryOptions = useMemo(() => {
    if (hasFullAccess || isAccountant) {
      return createApplicationOptions;
    }

    const allowedStorageTypes = new Set(accesses.map((access) => access.storage_type));

    return createApplicationOptions.filter((option) => allowedStorageTypes.has(option.storageType));
  }, [accesses, hasFullAccess, isAccountant]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateApplicationFormValues>({
    defaultValues: createApplicationDefaultValues,
    mode: 'onChange',
    resolver: zodResolver(createApplicationSchema),
  });

  const departmentId = useWatch({ control, name: 'departmentId' }) ?? '';
  const subdivisionId = useWatch({ control, name: 'subdivisionId' }) ?? '';

  const departmentOptions = useMemo(() => buildDepartmentOptions(warehouses), [warehouses]);
  const subdivisionOptions = useMemo(
    () => buildSubdivisionOptions(warehouses, departmentId ? [departmentId] : []),
    [departmentId, warehouses],
  );
  const storageOptions = useMemo(
    () =>
      buildStorageOptions(
        warehouses,
        departmentId ? [departmentId] : [],
        subdivisionId ? [subdivisionId] : [],
      ),
    [departmentId, subdivisionId, warehouses],
  );

  const createMutation = useMutationQuery<ApiResponse<unknown>, { body: CreateApplicationRequest }>(
    {
      method: 'post',
      url: applicationEndpoints.create,
      options: {
        onSuccess: () => {
          snackbar.show({
            title: 'Запрос создан',
            type: 'success',
          });
          reset(createApplicationDefaultValues);
          onSuccess();
          onClose();
        },
      },
    },
  );

  const handleClose = () => {
    reset(createApplicationDefaultValues);
    onClose();
  };

  const onSubmit: SubmitHandler<CreateApplicationFormValues> = (values) => {
    createMutation.mutate({
      body: {
        category: Number(values.category),
        description: values.description?.trim() || undefined,
        storage_id: Number(values.storageId),
        title: values.title.trim(),
      },
    });
  };

  return (
    <Modal className="w-125" isOpen={isOpen} onClose={handleClose} isCentered withCloseButton>
      <Modal.Header title="Создать запрос" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Content className="flex flex-col gap-4">
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input
                label="Название"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                hasError={Boolean(errors.title)}
                hintText={errors.title?.message}
                isHintAlwaysShown={Boolean(errors.title)}
                fullWidth
                bordered
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextArea
                label="Описание"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                rows={3}
                fullWidth
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                label="Тип товара"
                value={field.value || null}
                options={categoryOptions.map((option) => ({
                  label: option.label,
                  value: String(option.category),
                }))}
                onChange={(value) => field.onChange(normalizeSelectValue(value))}
                hasError={Boolean(errors.category)}
                hintText={errors.category?.message}
                isHintAlwaysShown={Boolean(errors.category)}
                fullWidth
              />
            )}
          />

          <Controller
            control={control}
            name="departmentId"
            render={({ field }) => (
              <Select
                label="Отдел"
                value={field.value || null}
                options={departmentOptions}
                onChange={(value) => {
                  field.onChange(normalizeSelectValue(value));
                  setValue('subdivisionId', '', { shouldValidate: true });
                  setValue('storageId', '', { shouldValidate: true });
                }}
                fullWidth
              />
            )}
          />

          <Controller
            control={control}
            name="subdivisionId"
            render={({ field }) => (
              <Select
                label="Здание"
                value={field.value || null}
                options={subdivisionOptions}
                onChange={(value) => {
                  field.onChange(normalizeSelectValue(value));
                  setValue('storageId', '', { shouldValidate: true });
                }}
                disabled={!departmentId}
                fullWidth
              />
            )}
          />

          <Controller
            control={control}
            name="storageId"
            render={({ field }) => (
              <Select
                label="Склад"
                value={field.value || null}
                options={storageOptions}
                onChange={(value) => field.onChange(normalizeSelectValue(value))}
                hasError={Boolean(errors.storageId)}
                hintText={errors.storageId?.message}
                isHintAlwaysShown={Boolean(errors.storageId)}
                disabled={!subdivisionId}
                fullWidth
              />
            )}
          />
        </Modal.Content>

        <Modal.Actions className="mt-4 flex justify-end gap-4">
          <Button type="button" variant="outline-neutral" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || createMutation.isPending}
            isLoading={createMutation.isPending}
          >
            Создать
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
