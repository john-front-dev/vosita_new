import { useState } from 'react';
import { Button, OutlineFinanceWalletTransfer, OutlineSystemHome } from 'alif-ui';

import type { TmzGoodRemain } from '@entities/tmz-good';
import { getStoredUser } from '@shared/lib';

import { TmzGoodDistributeModal } from './tmz-good-distribute-modal';
import { TmzGoodHistoryDownloadButton } from './tmz-good-history-download-button';
import { TmzGoodMoveModal } from './tmz-good-move-modal';

type Props = { goodsId: number; remains: TmzGoodRemain[]; storageId: number };

export const TmzGoodActions = ({ goodsId, remains, storageId }: Props) => {
  const [operation, setOperation] = useState<'distribute' | 'move' | null>(null);
  const isWarehouseManager = Boolean(getStoredUser()?.is_warehouse_manager);
  const quantity = remains.reduce((total, remain) => total + Number(remain.total_qty || 0), 0);
  return (
    <>
      <div className="flex flex-col gap-3">
        {isWarehouseManager && (
          <>
            <Button
              type="button"
              variant="outline-neutral"
              leftSection={<OutlineFinanceWalletTransfer />}
              disabled={!quantity}
              onClick={() => setOperation('distribute')}
            >
              Распределить
            </Button>
            <Button
              type="button"
              variant="outline-neutral"
              leftSection={<OutlineSystemHome />}
              disabled={!quantity}
              onClick={() => setOperation('move')}
            >
              Переместить
            </Button>
          </>
        )}
        <div className="[&>button]:w-full">
          <TmzGoodHistoryDownloadButton goodsId={goodsId} iconOnly={false} storageId={storageId} />
        </div>
      </div>
      {operation === 'distribute' && (
        <TmzGoodDistributeModal
          goodsId={goodsId}
          isOpen
          onClose={() => setOperation(null)}
          remains={remains}
          storageId={storageId}
        />
      )}
      {operation === 'move' && (
        <TmzGoodMoveModal
          goodsId={goodsId}
          isOpen
          onClose={() => setOperation(null)}
          remains={remains}
          storageId={storageId}
        />
      )}
    </>
  );
};
