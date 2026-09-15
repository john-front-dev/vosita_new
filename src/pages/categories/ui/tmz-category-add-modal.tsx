import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, Select } from 'alif-ui';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';

import {
  createTmzCategoryFormSchema,
  tmzCategoryFormDefaultValues,
  type TmzCategoryFormInput,
  type TmzCategoryFormValues,
} from '../model/tmz-category-form-validation';
import { useCreateTmzCategoryBindings } from '../model/use-category-mutations';
import { useTmzCategoryOptions } from '../model/use-tmz-category-options';

type Props = { isOpen: boolean; onClose: () => void };

export const TmzCategoryAddModal = ({ isOpen, onClose }: Props) => {
  const { categories, expenseTypes, isLoading, storages } = useTmzCategoryOptions(isOpen);
  const schema = useMemo(() => createTmzCategoryFormSchema(expenseTypes), [expenseTypes]);
  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<TmzCategoryFormInput, unknown, TmzCategoryFormValues>({
    defaultValues: tmzCategoryFormDefaultValues,
    mode: 'onChange',
    resolver: zodResolver(schema),
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'rows',
  });
  const { create, isCreating } = useCreateTmzCategoryBindings(onClose);

  const submit: SubmitHandler<TmzCategoryFormValues> = async ({ rows }) => {
    const body = rows.map(({ categoryId, expenseType, storageId }, index) => {
      return {
        accountant_number: expenseType.accountNumber ?? '',
        branchName: expenseType.branchName,
        category_id: Number(categoryId),
        expense_type_id: expenseType.id,
        id: index === 0 ? 1 : 0,
        name: expenseType.expenseType,
        storage_id: Number(storageId),
      };
    });
    await create(body);
  };

  return (
    <Modal className="w-160" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Добавить тип расхода" />
      <form onSubmit={handleSubmit(submit)}>
        <Modal.Content className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          {fields.map((row, index) => (
            <div
              className="flex flex-col gap-3 rounded-lg border border-solid border-neutral-200 p-4"
              key={row.id}
            >
              <div className="flex items-center justify-between gap-3">
                <span>Привязка {index + 1}</span>
                {fields.length > 1 && (
                  <Button type="button" variant="risk" size="s" onClick={() => remove(index)}>
                    Удалить
                  </Button>
                )}
              </div>
              <Controller
                control={control}
                name={`rows.${index}.storageId`}
                render={({ field, fieldState }) => (
                  <Select
                    label="Склад"
                    value={field.value || null}
                    options={storages.map(({ id, name }) => ({ label: name, value: String(id) }))}
                    onChange={(value) => field.onChange(value ?? '')}
                    onBlur={field.onBlur}
                    hasError={Boolean(fieldState.error)}
                    hintText={fieldState.error?.message}
                    isHintAlwaysShown={Boolean(fieldState.error)}
                    isLoading={isLoading}
                    fullWidth
                  />
                )}
              />
              <Controller
                control={control}
                name={`rows.${index}.expenseTypeId`}
                render={({ field, fieldState }) => (
                  <Select
                    label="Тип расхода"
                    value={field.value || null}
                    options={expenseTypes.map(({ expenseType, id }) => ({
                      label: expenseType,
                      value: id,
                    }))}
                    onChange={(value) => field.onChange(value ?? '')}
                    onBlur={field.onBlur}
                    hasError={Boolean(fieldState.error)}
                    hintText={fieldState.error?.message}
                    isHintAlwaysShown={Boolean(fieldState.error)}
                    isLoading={isLoading}
                    fullWidth
                  />
                )}
              />
              <Controller
                control={control}
                name={`rows.${index}.categoryId`}
                render={({ field, fieldState }) => (
                  <Select
                    label="Категория"
                    value={field.value || null}
                    options={categories.map(({ id, name }) => ({ label: name, value: String(id) }))}
                    onChange={(value) => field.onChange(value ?? '')}
                    onBlur={field.onBlur}
                    hasError={Boolean(fieldState.error)}
                    hintText={fieldState.error?.message}
                    isHintAlwaysShown={Boolean(fieldState.error)}
                    isLoading={isLoading}
                    fullWidth
                  />
                )}
              />
            </div>
          ))}
          {fields.length < 5 && (
            <Button
              type="button"
              variant="outline-neutral"
              onClick={() => append({ categoryId: '', expenseTypeId: '', storageId: '' })}
            >
              Добавить ещё привязку
            </Button>
          )}
        </Modal.Content>
        <Modal.Actions className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid} isLoading={isCreating}>
            Сохранить
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
