import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, OutlineSystemShoppingBasket, Select } from 'alif-ui';
import { useForm, useWatch } from 'react-hook-form';

import { useEmployees } from '@entities/employee';
import type { StockAsset, StockAssetType } from '@entities/stock-asset';

import { type IssueFormValues, issueSchema } from '../model/stock-asset-action-validation';
import { useStockAssetIssue } from '../model/use-stock-asset-action-mutations';

type Props = { asset: StockAsset; type: StockAssetType };

export const StockAssetIssueToWarehouseAction = ({ asset, type }: Props) => {
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
  const { isIssuing, issueToWarehouse } = useStockAssetIssue({
    assetId: asset.id,
    type,
    onSuccess: () => setIsOpen(false),
  });
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
        leftSection={<OutlineSystemShoppingBasket />}
        onClick={open}
      >
        Отправить на склад
      </Button>
      <Modal
        className="w-140"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered
        withCloseButton
      >
        <Modal.Header
          title={`Выдача ${type === 'other' ? 'объекта' : type === 'fixed-assets' ? 'ОС' : 'ПАУ'} на склад`}
        />
        <Modal.Content>
          <Select
            label="Заведующий складом"
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
              issueToWarehouse(selectedUserId),
            )}
          >
            Выдать
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
