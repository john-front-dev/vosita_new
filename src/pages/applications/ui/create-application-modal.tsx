import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, Select, TextArea } from 'alif-ui';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';

import {
  buildDepartmentOptions,
  buildStorageOptions,
  buildSubdivisionOptions,
  type WarehouseLocation,
} from '@entities/location';
import {
  getStoredAccesses,
  getStoredUser,
  isAccountant,
  isResponsible,
  isWarehouseManager,
} from '@shared/lib';

import { createApplicationOptions } from '../model/create-application-options';
import {
  createApplicationDefaultValues,
  type CreateApplicationFormValues,
  createApplicationSchema,
} from '../model/create-application-validation';
import { useCreateApplication } from '../model/use-create-application';

type CreateApplicationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  warehouses: WarehouseLocation[];
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
  warehouses,
}: CreateApplicationModalProps) => {
  const user = getStoredUser();
  const accesses = getStoredAccesses();
  const hasAccountantRole = isAccountant(accesses);
  const hasFullAccess = isResponsible(user) && !isWarehouseManager(user);
  const allowedStorageTypes = new Set(accesses.map((access) => access.storage_type));
  const categoryOptions =
    hasFullAccess || hasAccountantRole
      ? createApplicationOptions
      : createApplicationOptions.filter((option) =>
          allowedStorageTypes.has(option.storageType),
        );

  const {
    control,
    handleSubmit,
    reset,
    resetField,
    formState: { isValid },
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

  const { create, isCreating } = useCreateApplication(() => {
    reset(createApplicationDefaultValues);
    onClose();
  });

  const handleClose = () => {
    reset(createApplicationDefaultValues);
    onClose();
  };

  const onSubmit: SubmitHandler<CreateApplicationFormValues> = (values) => {
    create({
        category: Number(values.category),
        description: values.description?.trim() || undefined,
        storage_id: Number(values.storageId),
        title: values.title.trim(),
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
            render={({ field, fieldState }) => (
              <Input
                label="Название"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                hasError={fieldState.isDirty && Boolean(fieldState.error)}
                hintText={fieldState.isDirty ? fieldState.error?.message : undefined}
                isHintAlwaysShown={fieldState.isDirty && Boolean(fieldState.error)}
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
            render={({ field, fieldState }) => (
              <Select
                label="Тип товара"
                value={field.value || null}
                options={categoryOptions.map((option) => ({
                  label: option.label,
                  value: String(option.category),
                }))}
                onChange={(value) => field.onChange(normalizeSelectValue(value))}
                onBlur={field.onBlur}
                hasError={fieldState.isDirty && Boolean(fieldState.error)}
                hintText={fieldState.isDirty ? fieldState.error?.message : undefined}
                isHintAlwaysShown={fieldState.isDirty && Boolean(fieldState.error)}
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
                  resetField('subdivisionId');
                  resetField('storageId');
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
                  resetField('storageId');
                }}
                disabled={!departmentId}
                fullWidth
              />
            )}
          />

          <Controller
            control={control}
            name="storageId"
            render={({ field, fieldState }) => (
              <Select
                label="Склад"
                value={field.value || null}
                options={storageOptions}
                onChange={(value) => field.onChange(normalizeSelectValue(value))}
                onBlur={field.onBlur}
                hasError={fieldState.isDirty && Boolean(fieldState.error)}
                hintText={fieldState.isDirty ? fieldState.error?.message : undefined}
                isHintAlwaysShown={fieldState.isDirty && Boolean(fieldState.error)}
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
            disabled={!isValid || isCreating}
            isLoading={isCreating}
          >
            Создать
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
