import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, Select } from 'alif-ui';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { applicationUnits } from '../model/application-units';
import {
  subrequestDefaultValues,
  type SubrequestFormValues,
  subrequestSchema,
} from '../model/subrequest-validation';
import type { ApplicationObjectRecord } from '../model/types';
import { useSubrequestMutations } from '../model/use-subrequest-mutations';
import { useTmzCategories } from '../model/use-tmz-categories';

type SubrequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
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
  requestId,
  subrequest,
}: SubrequestModalProps) => {
  const isEditMode = Boolean(subrequest);
  const { categories, isLoading: isCategoriesLoading } = useTmzCategories({
    enabled: isOpen && !isEditMode,
  });
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

  const { createSubrequest, editSubrequest, isSubmitting } = useSubrequestMutations({
    onSuccess: () => {
      reset(subrequestDefaultValues);
      onClose();
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
    if (subrequest) {
      editSubrequest(subrequest.id, {
        name: values.name.trim(),
        price: Number(values.price),
      });
      return;
    }

    if (!requestId) {
      return;
    }

    createSubrequest({
      name: values.name.trim(),
      price: Number(values.price),
      quantity: Number(values.quantity),
      request_id: requestId,
      tmz_cat_id: Number(values.categoryId),
      unit: values.unit,
    });
  };

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
                    options={categories.map((category) => ({
                      label: category.name,
                      value: String(category.id),
                    }))}
                    onChange={(value) => field.onChange(normalizeSelectValue(value))}
                    hasError={Boolean(errors.categoryId)}
                    hintText={errors.categoryId?.message}
                    isHintAlwaysShown={Boolean(errors.categoryId)}
                    isLoading={isCategoriesLoading}
                    fullWidth
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
