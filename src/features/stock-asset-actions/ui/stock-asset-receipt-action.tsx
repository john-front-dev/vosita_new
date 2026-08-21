import { Button, OutlineSystemFileAccept } from 'alif-ui';

import type { StockAsset } from '@entities/stock-asset';
import { env } from '@shared/config';

export const StockAssetReceiptAction = ({ asset }: { asset: StockAsset }) => (
  <Button
    type="button"
    variant="outline-neutral"
    size="m"
    leftSection={<OutlineSystemFileAccept />}
    onClick={() =>
      window.open(`${env.apiBaseUrl}/download_receipt/${asset.receipt ?? asset.id}`, '_blank')
    }
  >
    Посмотреть чек
  </Button>
);
