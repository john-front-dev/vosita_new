import { useState } from 'react';
import { Button, OutlineSystemSend, OutlineSystemSettings } from 'alif-ui';

import type { StockAsset, StockAssetType } from '@entities/stock-asset';
import { ConfirmModal } from '@shared/ui';

import { useStockAssetRepair } from '../model/use-stock-asset-action-mutations';

export const StockAssetRepairAction = ({
  asset,
  type,
}: {
  asset: StockAsset;
  type: StockAssetType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const action = useStockAssetRepair({
    assetId: asset.id,
    type,
    onSuccess: () => setIsOpen(false),
  });
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
        title={`Вы уверены, что хотите ${isReturning ? 'вернуть объект с ремонта' : 'отправить объект в ремонт'}?`}
        confirmText="Уверен"
        isConfirmLoading={action.isRepairing}
        onClose={() => setIsOpen(false)}
        onConfirm={action.repair}
      />
    </>
  );
};
