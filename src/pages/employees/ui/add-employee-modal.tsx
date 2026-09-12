import { useState } from 'react';
import { Button, Input, Modal, snackbar } from 'alif-ui';

import { useMutationQuery } from '@shared/api';

import { employeesEndpoints } from '../api/employees-api';

type AddEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type CreateEmployeeBody = { email: string; name: string; organization: 'ALIF' };

export const AddEmployeeModal = ({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const normalizedName = name.trim();
  const normalizedEmail = email.trim();
  const isValid = normalizedName.length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const createEmployee = useMutationQuery<ApiResponse<unknown>, { body: CreateEmployeeBody }>({
    method: 'post',
    url: employeesEndpoints.create,
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Сотрудник добавлен', type: 'success' });
        setName('');
        setEmail('');
        onSuccess();
        onClose();
      },
      onError: () => snackbar.show({ title: 'Не удалось добавить сотрудника', type: 'error' }),
    },
  });

  return (
    <Modal className="w-125" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Добавление сотрудника" />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!isValid) return;
          createEmployee.mutate({
            body: { email: normalizedEmail, name: normalizedName, organization: 'ALIF' },
          });
        }}
      >
        <Modal.Content className="flex flex-col gap-4">
          <Input
            label="Ф.И.О."
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            bordered
          />
          <Input
            label="Электронная почта"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            bordered
          />
        </Modal.Content>
        <Modal.Actions className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline-neutral" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid}
            isLoading={createEmployee.isPending}
          >
            Добавить
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
