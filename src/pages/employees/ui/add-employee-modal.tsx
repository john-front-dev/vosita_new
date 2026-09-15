import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal } from 'alif-ui';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import {
  addEmployeeDefaultValues,
  type AddEmployeeFormValues,
  addEmployeeSchema,
} from '../model/add-employee-validation';
import { useCreateEmployee } from '../model/use-employee-mutations';

type AddEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const AddEmployeeModal = ({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) => {
  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
  } = useForm<AddEmployeeFormValues>({
    defaultValues: addEmployeeDefaultValues,
    mode: 'onChange',
    resolver: zodResolver(addEmployeeSchema),
  });
  const { create, isCreating } = useCreateEmployee(() => {
    reset();
    onSuccess();
    onClose();
  });
  const close = () => {
    reset();
    onClose();
  };
  const submit: SubmitHandler<AddEmployeeFormValues> = ({ email, name }) =>
    create(name, email);

  return (
    <Modal className="w-125" isOpen={isOpen} onClose={close} isCentered withCloseButton>
      <Modal.Header title="Добавление сотрудника" />
      <form onSubmit={handleSubmit(submit)}>
        <Modal.Content className="flex flex-col gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                label="Ф.И.О."
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                hasError={Boolean(fieldState.error)}
                hintText={fieldState.error?.message}
                isHintAlwaysShown={Boolean(fieldState.error)}
                fullWidth
                bordered
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Input
                label="Электронная почта"
                type="email"
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                hasError={Boolean(fieldState.error)}
                hintText={fieldState.error?.message}
                isHintAlwaysShown={Boolean(fieldState.error)}
                fullWidth
                bordered
              />
            )}
          />
        </Modal.Content>
        <Modal.Actions className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline-neutral" onClick={close}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid} isLoading={isCreating}>
            Добавить
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
