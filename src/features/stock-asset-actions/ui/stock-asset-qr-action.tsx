import { Button, OutlineSystemDownload, Typography } from 'alif-ui';

import type { StockAsset, StockAssetType } from '@entities/stock-asset';
import { QrCode } from '@shared/ui';

type StockAssetQrProps = { asset: StockAsset };
type StockAssetQrActionProps = StockAssetQrProps & { type: StockAssetType };

const downloadQr = (asset: StockAsset, type: StockAssetType) => {
  const image = document.querySelector<HTMLImageElement>('.stock-asset-qr');

  if (!image?.src) return;

  const link = document.createElement('a');

  link.href = image.src;
  const prefix = type === 'other' ? 'Другое' : type === 'lri' ? 'ПАУ' : 'ОС';

  link.download = `${prefix}-${asset.inventory_number ?? asset.id}.png`;
  link.click();
};

export const StockAssetQr = ({ asset }: StockAssetQrProps) => (
  <div className="flex flex-col items-center gap-3 pt-6 text-center">
    <QrCode
      className="stock-asset-qr"
      value={asset.inventory_number ?? String(asset.id)}
      size={220}
    />
    <Typography
      element="div"
      category="heading"
      proportions="h4"
      className="text-(--color-text-primary)"
    >
      {asset.inventory_number || '-'}
    </Typography>
  </div>
);

export const StockAssetQrAction = ({ asset, type }: StockAssetQrActionProps) => {
  return (
    <Button
      type="button"
      variant="outline-neutral"
      size="m"
      leftSection={<OutlineSystemDownload />}
      onClick={() => downloadQr(asset, type)}
    >
      Загрузить QR
    </Button>
  );
};
