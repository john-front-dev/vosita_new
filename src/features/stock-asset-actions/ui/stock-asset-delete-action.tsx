import { useState } from 'react';
import { Button, OutlineSystemTrash } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import type { StockAsset, StockAssetType } from '@entities/stock-asset';
import { routes } from '@shared/config';
import { ConfirmModal } from '@shared/ui';

import { useStockAssetDelete } from '../model/use-stock-asset-action-mutations';

const returnRoute: Record<StockAssetType, string> = {
  'fixed-assets': routes.fixedAssets,
  lri: routes.lri,
  other: routes.others,
};

export const StockAssetDeleteAction = ({
  asset,
  type,
}: {
  asset: StockAsset;
  type: StockAssetType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { deleteAsset, isDeleting } = useStockAssetDelete({
    assetId: asset.id,
    type,
    onSuccess: () => navigate(returnRoute[type]),
  });

  return (
    <>
      <Button
        type="button"
        variant="risk"
        size="m"
        leftSection={<OutlineSystemTrash />}
        onClick={() => setIsOpen(true)}
      >
        Удалить
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        title="Вы уверены, что хотите удалить данный объект?"
        message="Объект будет удалён без возможности восстановления."
        confirmText="Удалить"
        width="large"
        variant="risk"
        isConfirmLoading={isDeleting}
        onClose={() => setIsOpen(false)}
        onConfirm={deleteAsset}
      />
    </>
  );
};
