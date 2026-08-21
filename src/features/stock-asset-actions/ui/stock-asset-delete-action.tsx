import { useState } from 'react';
import { Button, OutlineSystemTrash } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import type { StockAsset } from '@entities/stock-asset';
import { routes } from '@shared/config';
import { ConfirmModal } from '@shared/ui';

import { useStockAssetDelete } from '../model/use-stock-asset-action-mutations';

export const StockAssetDeleteAction = ({ asset }: { asset: StockAsset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const action = useStockAssetDelete({
    assetId: asset.id,
    onSuccess: () => navigate(routes.fixedAssetsStock),
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
        title="Вы уверены, что хотите удалить данный ОС?"
        message="Объект будет удалён без возможности восстановления."
        confirmText="Удалить"
        width="large"
        variant="risk"
        isConfirmLoading={action.isDeleting}
        onClose={() => setIsOpen(false)}
        onConfirm={action.deleteAsset}
      />
    </>
  );
};
