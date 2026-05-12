import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, Select, snackbar } from 'alif-ui';
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { useMutationQuery } from '@shared/api';

import { applicationEndpoints } from '../api/applications-api';
import { applicationUnits } from '../model/application-units';
import {
  subrequestDefaultValues,
  type SubrequestFormValues,
  subrequestSchema,
} from '../model/subrequest-validation';
import type {
  ApplicationObjectRecord,
  CreateSubrequestRequest,
  UpdateSubrequestRequest,
} from '../model/types';
import { useTmzCategories } from '../model/use-tmz-categories';

type SubrequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId?: number;
  subrequest?: ApplicationObjectRecord;
};

const normalizeSelectValue = (value: unknown) => {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return String(value.value);
  }

  return value ? String(value) : '';
};

const normalizeDecimalInput = (value: string) =>
  value
    .replace(/,/g, '.')
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1');

export const SubrequestModal = ({
  isOpen,
  onClose,
  onSuccess,
  requestId,
  subrequest,
}: SubrequestModalProps) => {
  const isEditMode = Boolean(subrequest);
  const categoriesQuery = useTmzCategories({ enabled: isOpen && !isEditMode });
  const formDefaultValues = useMemo<SubrequestFormValues>(
    () => ({
      categoryId: subrequest?.tmz_cat_id ? String(subrequest.tmz_cat_id) : '',
      name: subrequest?.name ?? subrequestDefaultValues.name,
      price:
        subrequest?.price !== undefined ? String(subrequest.price) : subrequestDefaultValues.price,
      quantity:
        subrequest?.quantity !== undefined
          ? String(subrequest.quantity)
          : subrequestDefaultValues.quantity,
      unit: subrequest?.unit ?? subrequestDefaultValues.unit,
    }),
    [subrequest],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SubrequestFormValues>({
    defaultValues: formDefaultValues,
    mode: 'onChange',
    resolver: zodResolver(subrequestSchema),
  });

  const createMutation = useMutationQuery<ApiResponse<unknown>, { body: CreateSubrequestRequest }>({
    method: 'post',
    url: applicationEndpoints.createSubrequest,
    options: {
      onSuccess: () => {
        snackbar.show({
          title: 'Объект добавлен',
          type: 'success',
        });
        reset(subrequestDefaultValues);
        onSuccess();
        onClose();
      },
    },
  });

  const editMutation = useMutationQuery<ApiResponse<unknown>, { body: UpdateSubrequestRequest }>({
    method: 'post',
    url: subrequest ? applicationEndpoints.editSubrequest(subrequest.id) : '',
    options: {
      onSuccess: () => {
        snackbar.show({
          title: 'Успешно',
          type: 'success',
        });
        reset(subrequestDefaultValues);
        onSuccess();
        onClose();
      },
    },
  });

  useEffect(() => {
    reset(formDefaultValues);
  }, [formDefaultValues, reset]);

  const handleClose = () => {
    reset(subrequestDefaultValues);
    onClose();
  };

  const onSubmit: SubmitHandler<SubrequestFormValues> = (values) => {
    if (isEditMode) {
      editMutation.mutate({
        body: {
          name: values.name.trim(),
          price: Number(values.price),
        },
      });
      return;
    }

    if (!requestId) {
      return;
    }

    createMutation.mutate({
      body: {
        name: values.name.trim(),
        price: Number(values.price),
        quantity: Number(values.quantity),
        request_id: requestId,
        tmz_cat_id: Number(values.categoryId),
        unit: values.unit,
      },
    });
  };

  const isSubmitting = createMutation.isPending || editMutation.isPending;

  return (
    <Modal className="w-125" isOpen={isOpen} onClose={handleClose} isCentered withCloseButton>
      <Modal.Header title={isEditMode ? 'Изменить' : 'Добавить'} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Content className="flex flex-col gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                label="Название"
                value={field.value}
                onChange={field.onChange}
                hasError={Boolean(errors.name)}
                hintText={errors.name?.message}
                isHintAlwaysShown={Boolean(errors.name)}
                fullWidth
                bordered
              />
            )}
          />

          {!isEditMode && (
            <>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select
                    label="Ед. измерения"
                    value={field.value || null}
                    options={[...applicationUnits]}
                    onChange={(value) => field.onChange(normalizeSelectValue(value))}
                    hasError={Boolean(errors.unit)}
                    hintText={errors.unit?.message}
                    isHintAlwaysShown={Boolean(errors.unit)}
                    fullWidth
                  />
                )}
              />

              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    label="Категория"
                    value={field.value || null}
                    options={categoriesQuery.categories.map((category) => ({
                      label: category.name,
                      value: String(category.id),
                    }))}
                    onChange={(value) => field.onChange(normalizeSelectValue(value))}
                    hasError={Boolean(errors.categoryId)}
                    hintText={errors.categoryId?.message}
                    isHintAlwaysShown={Boolean(errors.categoryId)}
                    isLoading={categoriesQuery.isLoading}
                    fullWidth
                    hasSearch
                  />
                )}
              />
            </>
          )}

          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <Input
                label="Цена"
                value={field.value}
                onChange={(event) => field.onChange(normalizeDecimalInput(event.target.value))}
                hasError={Boolean(errors.price)}
                hintText={errors.price?.message}
                isHintAlwaysShown={Boolean(errors.price)}
                fullWidth
                bordered
              />
            )}
          />

          {!isEditMode && (
            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <Input
                  label="Количество"
                  value={field.value}
                  onChange={(event) => field.onChange(normalizeDecimalInput(event.target.value))}
                  hasError={Boolean(errors.quantity)}
                  hintText={errors.quantity?.message}
                  isHintAlwaysShown={Boolean(errors.quantity)}
                  fullWidth
                  bordered
                />
              )}
            />
          )}
        </Modal.Content>

        <Modal.Actions className="mt-4 flex justify-end gap-4">
          <Button type="button" variant="outline-neutral" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
          >
            {isEditMode ? 'Изменить' : 'Добавить'}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
