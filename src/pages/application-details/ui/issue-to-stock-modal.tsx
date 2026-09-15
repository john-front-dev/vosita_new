import { useState } from 'react';
import { Button, DatePicker, Input, Modal, snackbar, Switch, Typography } from 'alif-ui';

import { formatDateOnly, parseDateOnly } from '@shared/lib';

import type {
  ApplicationListType,
  ApplicationObjectRecord,
} from '../model/types';
import { useIssueApplicationObjects } from '../model/use-application-stock-actions';

type IssueToStockModalProps = {
  categoryId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  records: ApplicationObjectRecord[];
  storageId?: number;
  type: ApplicationListType;
};

export const IssueToStockModal = ({
  categoryId,
  isOpen,
  onClose,
  onSuccess,
  records,
  storageId,
  type,
}: IssueToStockModalProps) => {
  const [registrationDate, setRegistrationDate] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [minQuantity, setMinQuantity] = useState('');
  const registrationDateValue = parseDateOnly(registrationDate);
  const isTmz = type === 'tmz';
  const maximumThreshold = records.length
    ? Math.min(...records.map((record) => Number(record.quantity) || 0)) - 1
    : 0;
  const canEnableNotification = maximumThreshold >= 0.001;
  const { isIssuing, issue } = useIssueApplicationObjects(type, () => {
    onSuccess();
    onClose();
  });

  const handleIssue = () => {
    if (!registrationDate) {
      snackbar.show({
        title: 'Выберите дату оформления',
        type: 'error',
      });
      return;
    }

    const parsedThreshold = Number(minQuantity);
    if (
      isTmz &&
      notifyEnabled &&
      (minQuantity === '' ||
        !Number.isFinite(parsedThreshold) ||
        parsedThreshold < 0.001 ||
        parsedThreshold > maximumThreshold)
    ) {
      snackbar.show({
        title: `Минимальное количество: от 0.001 до ${maximumThreshold}`,
        type: 'error',
      });
      return;
    }

    issue({
        objects: records.map((record) => ({
          id: record.id,
          ...(isTmz ? { category_id: record.tmz_cat_id ?? categoryId } : {}),
          ...(isTmz && notifyEnabled ? { min_qty: parsedThreshold, notify: true } : {}),
        })),
        registration_date: registrationDate,
        ...(isTmz ? { storage_id: storageId ?? records[0]?.storage_id } : {}),
    });
  };

  return (
    <Modal className="w-130" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Отправка на склад" />
      <Modal.Content>
        <DatePicker
          label="Дата оформления"
          values={registrationDateValue}
          onDateChange={(date) => {
            if (!(date instanceof Date)) {
              setRegistrationDate('');
              return;
            }

            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (date > today) {
              snackbar.show({ title: 'Дата оформления не может быть в будущем', type: 'error' });
              return;
            }

            setRegistrationDate(formatDateOnly(date));
          }}
          onClear={() => setRegistrationDate('')}
          allowTime={false}
          fullWidth
        />
        {isTmz && (
          <div className="mt-5 flex flex-col gap-4">
            <Switch
              checked={notifyEnabled}
              disabled={!canEnableNotification}
              label="Уведомлять о низком остатке"
              onChange={(event) => {
                setNotifyEnabled(event.target.checked);
                if (!event.target.checked) setMinQuantity('');
              }}
            />
            {!canEnableNotification && (
              <Typography category="body" proportions="s" className="text-(--color-text-muted)">
                Остатка товара недостаточно, чтобы задать минимальное количество.
              </Typography>
            )}
            {notifyEnabled && (
              <Input
                label="Минимальное количество"
                type="number"
                min={0.001}
                max={maximumThreshold}
                step={0.001}
                value={minQuantity}
                placeholder={`До ${maximumThreshold}`}
                onChange={(event) => setMinQuantity(event.target.value)}
                fullWidth
                bordered
              />
            )}
          </div>
        )}
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-3">
        <Button type="button" variant="outline-neutral" onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={!registrationDate || isIssuing}
          isLoading={isIssuing}
          onClick={handleIssue}
        >
          Выдать
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
