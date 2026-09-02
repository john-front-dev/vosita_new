import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, OutlineSystemUser, Select } from 'alif-ui';
import { useForm, useWatch } from 'react-hook-form';

import { useEmployees } from '@entities/employee';
import type { StockAsset, StockAssetType } from '@entities/stock-asset';
import { normalizeSelectValue } from '@shared/lib';

import { type IssueFormValues, issueSchema } from '../model/stock-asset-action-validation';
import { useStockAssetIssue } from '../model/use-stock-asset-action-mutations';

type Props = { asset: StockAsset; type: StockAssetType };

export const StockAssetIssueToEmployeeAction = ({ asset, type }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<IssueFormValues>({
    defaultValues: { userId: '' },
    mode: 'onChange',
    resolver: zodResolver(issueSchema),
  });
  const values = useWatch({ control: form.control });
  const { employees } = useEmployees('', isOpen);
  const action = useStockAssetIssue({ assetId: asset.id, type, onSuccess: () => setIsOpen(false) });
  const isAccepting = asset.status_id === 19;
  const open = () => {
    form.reset();
    setIsOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="m"
        leftSection={<OutlineSystemUser />}
        onClick={open}
      >
        {isAccepting ? 'В ожидании' : 'Выдать сотруднику'}
      </Button>
      <Modal
        className="w-[560px]"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered
        withCloseButton
      >
        <Modal.Header title={isAccepting ? 'Принять объект' : 'Выдача сотруднику'} />
        <Modal.Content>
          <Select
            label="Ответственное лицо"
            value={values.userId || null}
            options={employees.map((item) => ({
              label: item.full_name,
              value: String(item.id),
            }))}
            onChange={(value) =>
              form.setValue('userId', normalizeSelectValue(value), { shouldValidate: true })
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
            onClick={form.handleSubmit(({ userId }) => action.issueToEmployee(userId))}
          >
            {isAccepting ? 'Принять' : 'Выдать'}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
