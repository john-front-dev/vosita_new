import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, OutlineSystemUser, Select } from 'alif-ui';
import { useForm, useWatch } from 'react-hook-form';

import { useEmployees } from '@entities/employee';
import { useCabinets } from '@entities/location';
import type { MbpDetails } from '@entities/mbp';
import { normalizeSelectValue } from '@shared/lib';

import { type MbpIssueFormValues, mbpIssueSchema } from '../model/mbp-action-validation';
import { useMbpIssueToEmployee } from '../model/use-mbp-action-mutations';

export const MbpIssueAction = ({ mbp }: { mbp: MbpDetails }) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<MbpIssueFormValues>({
    defaultValues: { employeeId: '', responsibleId: '', roomId: '' },
    mode: 'onChange',
    resolver: zodResolver(mbpIssueSchema),
  });
  const values = useWatch({ control: form.control });
  const employeesQuery = useEmployees('', isOpen);
  const cabinetsQuery = useCabinets(String(mbp.subdivision_id ?? ''), '', isOpen);
  const action = useMbpIssueToEmployee({ id: mbp.id, onSuccess: () => setIsOpen(false) });

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="m"
        leftSection={<OutlineSystemUser />}
        onClick={() => {
          form.reset();
          setIsOpen(true);
        }}
      >
        Выдать сотруднику
      </Button>
      <Modal
        className="w-140"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered
        withCloseButton
      >
        <Modal.Header title="Выдача МБП сотруднику" />
        <Modal.Content className="flex flex-col gap-4">
          <Select
            label="Ответственное лицо"
            value={values.responsibleId || null}
            options={employeesQuery.employees.map((employee) => ({
              label: employee.full_name,
              value: String(employee.id),
            }))}
            onChange={(value) =>
              form.setValue('responsibleId', normalizeSelectValue(value), { shouldValidate: true })
            }
            fullWidth
          />
          <Select
            label="Сотрудник"
            value={values.employeeId || null}
            options={employeesQuery.employees.map((employee) => ({
              label: employee.full_name,
              value: String(employee.id),
            }))}
            onChange={(value) =>
              form.setValue('employeeId', normalizeSelectValue(value), { shouldValidate: true })
            }
            fullWidth
          />
          <Select
            label="Кабинет"
            value={values.roomId || null}
            options={cabinetsQuery.cabinets.map((room) => ({
              label: room.room,
              value: String(room.id),
            }))}
            onChange={(value) =>
              form.setValue('roomId', normalizeSelectValue(value), { shouldValidate: true })
            }
            fullWidth
          />
        </Modal.Content>
        <Modal.Actions className="flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={action.isIssuing}
            disabled={!form.formState.isValid}
            onClick={form.handleSubmit((formValues) =>
              action.issue({
                employee_uuid: formValues.employeeId,
                id: Number(mbp.id),
                responsible_id: formValues.responsibleId,
                rooms_id: Number(formValues.roomId),
              }),
            )}
          >
            Выдать МБП
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
