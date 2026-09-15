import { OutlineSystemShoppingBasket, OutlineSystemTrash } from 'alif-ui';

import type { MbpDetails } from '@entities/mbp';
import { getStoredUser } from '@shared/lib';

import {
  useMbpDestroy,
  useMbpIssueToWarehouse,
  useMbpWriteOff,
} from '../model/use-mbp-action-mutations';
import { MbpConfirmAction } from './mbp-confirm-action';
import { MbpEditAction } from './mbp-edit-action';
import { MbpIssueAction } from './mbp-issue-action';

export const MbpActions = ({ mbp }: { mbp: MbpDetails }) => {
  const user = getStoredUser();
  const { isPending: isIssuing, run: issueToWarehouse } = useMbpIssueToWarehouse({ id: mbp.id });
  const { isPending: isWritingOff, run: writeOff } = useMbpWriteOff({ id: mbp.id });
  const { isPending: isDestroying, run: destroy } = useMbpDestroy({ id: mbp.id });

  if (user?.access !== 'редактор' || mbp.status === 21 || mbp.status === 22) return null;

  return (
    <div className="flex flex-col items-end gap-3 pt-3">
      <MbpEditAction mbp={mbp} />
      {(mbp.status === 8 || mbp.status === 19) && (
        <MbpConfirmAction
          label="Отправить на склад"
          title="Отправка МБП на склад"
          message="Вы уверены, что хотите отправить этот МБП на склад?"
          confirmText="Отправить"
          icon={<OutlineSystemShoppingBasket />}
          isPending={isIssuing}
          onConfirm={issueToWarehouse}
        />
      )}
      {mbp.status === 10 && (
        <>
          <MbpIssueAction mbp={mbp} />
          <MbpConfirmAction
            label="Списать"
            title="Списание МБП"
            message="Вы уверены, что хотите отметить этот МБП как списанный?"
            confirmText="Списать"
            icon={<OutlineSystemTrash />}
            isPending={isWritingOff}
            onConfirm={writeOff}
          />
          <MbpConfirmAction
            label="Уничтожить"
            title="Списание МБП (уничтожение)"
            message="Вы уверены, что хотите отметить этот МБП как уничтоженный?"
            confirmText="Уничтожить"
            icon={<OutlineSystemTrash />}
            isPending={isDestroying}
            onConfirm={destroy}
            variant="risk"
          />
        </>
      )}
    </div>
  );
};
