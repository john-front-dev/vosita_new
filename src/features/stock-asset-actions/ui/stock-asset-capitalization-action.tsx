import { useState } from 'react';
import { Button, OutlineFinanceDollar } from 'alif-ui';

import { AddStockAssetCapitalizationModal } from '@features/stock-asset-capitalization';
import type { StockAsset } from '@entities/stock-asset';

export const StockAssetCapitalizationAction = ({ asset }: { asset: StockAsset }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="m"
        leftSection={<OutlineFinanceDollar />}
        onClick={() => setIsOpen(true)}
      >
        Добавить капитализацию
      </Button>
      <AddStockAssetCapitalizationModal
        assetId={asset.id}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
