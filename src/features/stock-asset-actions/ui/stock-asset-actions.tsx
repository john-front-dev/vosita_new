import {
  isOsLikeStockAssetType,
  type StockAsset,
  type StockAssetType,
} from '@entities/stock-asset';
import { getStoredUser } from '@shared/lib';

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
  const isOsLike = isOsLikeStockAssetType(type);
  const canManage = getStoredUser()?.access === 'редактор';
  const showIssueToWarehouse = asset.status_id === 3 || (isOsLike && asset.status_id === 19);
  const showIssueToEmployee =
    asset.status_id === 1 || asset.status_id === 2 || (isOsLike && asset.status_id === 19);

  return (
    <>
      {isOsLike && <StockAssetQr asset={asset} />}
      <div className="flex flex-col items-end gap-3 pt-3">
        <StockAssetReceiptAction asset={asset} />
        {isOsLike && <StockAssetQrAction asset={asset} type={type} />}
        {canManage && (
          <>
            <StockAssetEditAction asset={asset} type={type} />
            <StockAssetCapitalizationAction asset={asset} />
            {showIssueToWarehouse && <StockAssetIssueToWarehouseAction asset={asset} type={type} />}
            {showIssueToEmployee && <StockAssetIssueToEmployeeAction asset={asset} type={type} />}
            {isOsLike && <StockAssetRepairAction asset={asset} type={type} />}
            {type !== 'other' && <StockAssetDeleteAction asset={asset} type={type} />}
          </>
        )}
      </div>
    </>
  );
};
