import type { StockAsset, StockAssetType } from '@entities/stock-asset';

import { StockAssetCapitalizationAction } from './stock-asset-capitalization-action';
import { StockAssetDeleteAction } from './stock-asset-delete-action';
import { StockAssetEditAction } from './stock-asset-edit-action';
import { StockAssetIssueToEmployeeAction } from './stock-asset-issue-to-employee-action';
import { StockAssetIssueToWarehouseAction } from './stock-asset-issue-to-warehouse-action';
import { StockAssetQr, StockAssetQrAction } from './stock-asset-qr-action';
import { StockAssetReceiptAction } from './stock-asset-receipt-action';
import { StockAssetRepairAction } from './stock-asset-repair-action';

type StockAssetActionsProps = { asset: StockAsset; type: StockAssetType };

export const StockAssetActions = ({ asset, type }: StockAssetActionsProps) => {
  const showIssueToWarehouse =
    asset.status_id === 3 || (type === 'fixed-assets' && asset.status_id === 19);
  const showIssueToEmployee =
    asset.status_id === 1 ||
    asset.status_id === 2 ||
    (type === 'fixed-assets' && asset.status_id === 19);

  return (
    <>
      {type === 'fixed-assets' && <StockAssetQr asset={asset} />}
      <div className="flex flex-col items-end gap-3 pt-3">
        <StockAssetReceiptAction asset={asset} />
        {type === 'fixed-assets' && <StockAssetQrAction asset={asset} />}
        <StockAssetEditAction asset={asset} type={type} />
        <StockAssetCapitalizationAction asset={asset} />
        {showIssueToWarehouse && <StockAssetIssueToWarehouseAction asset={asset} type={type} />}
        {showIssueToEmployee && <StockAssetIssueToEmployeeAction asset={asset} type={type} />}
        {type === 'fixed-assets' && <StockAssetRepairAction asset={asset} />}
        <StockAssetDeleteAction asset={asset} />
      </div>
    </>
  );
};
