import { useState } from 'react';
import { Button, OutlineSystemSend, OutlineSystemSettings } from 'alif-ui';

import type { StockAsset } from '@entities/stock-asset';
import { ConfirmModal } from '@shared/ui';

import { useStockAssetRepair } from '../model/use-stock-asset-action-mutations';

export const StockAssetRepairAction = ({ asset }: { asset: StockAsset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const action = useStockAssetRepair({ assetId: asset.id, onSuccess: () => setIsOpen(false) });
  const isReturning = asset.is_repair === 1;

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="m"
        leftSection={isReturning ? <OutlineSystemSend /> : <OutlineSystemSettings />}
        onClick={() => setIsOpen(true)}
      >
        {isReturning ? 'Вернуть с ремонта' : 'Отправить в ремонт'}
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        title={`Вы уверены, что хотите ${isReturning ? 'вернуть ОС с ремонта' : 'отправить ОС в ремонт'}?`}
        confirmText="Уверен"
        isConfirmLoading={action.isRepairing}
        onClose={() => setIsOpen(false)}
        onConfirm={action.repair}
      />
    </>
  );
};
