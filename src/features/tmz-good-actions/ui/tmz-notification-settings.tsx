import { useState } from 'react';
import { Button, Input, Modal, OutlineSystemSettings, snackbar, Switch, Typography } from 'alif-ui';

import {
  type NotificationSetting,
  useNotificationSetting,
  useUpdateNotificationSetting,
} from '@entities/notification';

type Props = { goodsId: number; storageId: number };

export const TmzNotificationSettings = ({ goodsId, storageId }: Props) => {
  const { setting } = useNotificationSetting(goodsId, storageId);

  if (!setting) return null;

  return (
    <TmzNotificationSettingsContent
      key={`${setting.enabled}-${setting.min_qty}-${setting.notified}-${setting.current_qty}`}
      goodsId={goodsId}
      setting={setting}
      storageId={storageId}
    />
  );
};

const TmzNotificationSettingsContent = ({
  goodsId,
  setting,
  storageId,
}: Props & { setting: NotificationSetting }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(setting.enabled);
  const [minQuantity, setMinQuantity] = useState(setting.enabled ? String(setting.min_qty) : '');
  const { isPending, mutate } = useUpdateNotificationSetting();

  const maximumThreshold = setting.current_qty - 1;
  const parsedThreshold = Number(minQuantity);
  const canEnable = setting.current_qty >= 1.001;
  const isThresholdValid =
    minQuantity !== '' &&
    Number.isFinite(parsedThreshold) &&
    parsedThreshold >= 0.001 &&
    parsedThreshold <= maximumThreshold;

  const handleSave = () => {
    if (enabled && !canEnable) {
      snackbar.show({
        title: 'Недостаточно остатка для изменения порога',
        type: 'error',
      });
      return;
    }
    if (enabled && !isThresholdValid) {
      snackbar.show({
        title: `Минимальное количество: от 0.001 до ${maximumThreshold}`,
        type: 'error',
      });
      return;
    }

    mutate(
      {
        enabled,
        goodsId,
        minQuantity: parsedThreshold,
        previouslyEnabled: setting.enabled,
        storageId,
      },
      {
        onError: (error) =>
          snackbar.show({
            title: error.message || 'Не удалось сохранить настройку',
            type: 'error',
          }),
        onSuccess: () => {
          snackbar.show({
            title: enabled ? 'Настройка уведомления сохранена' : 'Уведомление отключено',
            type: 'success',
          });
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        leftSection={<OutlineSystemSettings />}
        onClick={() => setIsOpen(true)}
      >
        Настройка уведомлений
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered withCloseButton>
        <Modal.Header title="Настройка уведомлений" />
        <Modal.Content>
          <div className="flex flex-col gap-5">
            <div>
              <Typography category="body" proportions="mStrong">
                {setting.goods_name}
              </Typography>
              <Typography category="body" proportions="s" className="text-(--color-text-muted)">
                Текущий остаток: {setting.current_qty}
              </Typography>
            </div>
            <Switch
              checked={enabled}
              disabled={!canEnable && !setting.enabled}
              label="Уведомлять о низком остатке"
              onChange={(event) => {
                setEnabled(event.target.checked);
                if (event.target.checked && !minQuantity) setMinQuantity('0.001');
              }}
            />
            {!canEnable && (
              <Typography category="body" proportions="s" className="text-(--color-text-muted)">
                Остатка недостаточно, чтобы{' '}
                {setting.enabled
                  ? 'изменить порог. Уведомление можно отключить.'
                  : 'включить уведомление.'}
              </Typography>
            )}
            {enabled && (
              <Input
                label="Минимальное количество"
                type="number"
                min={0.001}
                max={maximumThreshold}
                step={0.001}
                value={minQuantity}
                onChange={(event) => setMinQuantity(event.target.value)}
                fullWidth
                bordered
              />
            )}
            {setting.notified && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Уведомление уже было отправлено. Изменение порога позволит отправить его повторно.
              </div>
            )}
          </div>
        </Modal.Content>
        <Modal.Actions className="flex justify-end gap-3">
          <Button type="button" variant="outline-neutral" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isPending}
            disabled={isPending}
            onClick={() => handleSave()}
          >
            Сохранить
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
