import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, OutlineSystemUser, Select } from 'alif-ui';
import { useForm, useWatch } from 'react-hook-form';

import { useEmployees } from '@entities/employee';
import type { StockAsset, StockAssetType } from '@entities/stock-asset';

import { type IssueFormValues, issueSchema } from '../model/stock-asset-action-validation';
import { useStockAssetIssue } from '../model/use-stock-asset-action-mutations';

type Props = { asset: StockAsset; type: StockAssetType };

export const StockAssetIssueToEmployeeAction = ({ asset, type }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<IssueFormValues>({
    defaultValues: { userId: '' },
    mode: 'onChange',
    resolver: zodResolver(issueSchema),
  });
  const { userId } = useWatch({ control });
  const { employees } = useEmployees('', isOpen);
  const { isIssuing, issueToEmployee } = useStockAssetIssue({
    assetId: asset.id,
    type,
    onSuccess: () => setIsOpen(false),
  });
  const isAccepting = asset.status_id === 19;
  const open = () => {
    reset();
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
            value={userId || null}
            options={employees.map((item) => ({
              label: item.full_name,
              value: String(item.id),
            }))}
            onChange={(value) =>
              setValue('userId', value ?? '', { shouldValidate: true })
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
            isLoading={isIssuing}
            disabled={!isValid}
            onClick={handleSubmit(({ userId: selectedUserId }) =>
              issueToEmployee(selectedUserId),
            )}
          >
            {isAccepting ? 'Принять' : 'Выдать'}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
