import { Loader, Modal, Typography } from 'alif-ui';

import { formatMoney } from '@shared/lib';
import { DetailsRow } from '@shared/ui';

import { formatCapitalizationDate } from '../model/capitalization-utils';
import { useCapitalizationDetails } from '../model/use-capitalization-details';

type CapitalizationDetailsModalProps = {
  capitalizationId: number | null;
  onClose: () => void;
};

export const CapitalizationDetailsModal = ({
  capitalizationId,
  onClose,
}: CapitalizationDetailsModalProps) => {
  const details = useCapitalizationDetails(capitalizationId);
  const capitalization = details.capitalization;

  return (
    <Modal
      className="w-140"
      isOpen={capitalizationId !== null}
      onClose={onClose}
      isCentered
      withCloseButton
    >
      <Modal.Header title="Капитализация" />
      <Modal.Content>
        {details.isLoading && (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        )}
        {details.isError && (
          <Typography category="body" proportions="s" className="text-(--color-danger)">
            Не удалось загрузить запись капитализации.
          </Typography>
        )}
        {capitalization && (
          <div>
            <DetailsRow label="Объект" value={capitalization.warehouse_name || undefined} />
            <DetailsRow
              label="Сумма"
              value={formatMoney(capitalization.capitalization, {
                currency: capitalization.currency || undefined,
              })}
            />
            <DetailsRow label="Описание" value={capitalization.comment || 'Без описания'} />
            <DetailsRow label="Дата" value={formatCapitalizationDate(capitalization)} />
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
};
