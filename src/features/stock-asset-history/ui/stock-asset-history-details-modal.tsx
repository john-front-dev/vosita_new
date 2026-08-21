import { Modal, OutlineSystemAlertCircle, Typography } from 'alif-ui';
import type { ReactNode } from 'react';

import { useStockAssetHistoryDetails } from '@entities/stock-asset';
import { formatDate, formatMoney } from '@shared/lib';

type StockAssetHistoryDetailsModalProps = {
  historyId: number | string | null;
  onClose: () => void;
};

type HistoryValue = string | number | null | undefined;

type HistoryField = {
  label: string;
  newLabel: string;
  oldLabel: string;
  newValue?: HistoryValue;
  oldValue?: HistoryValue;
};

type HistoryGroup = {
  marker: ReactNode;
  fields: HistoryField[];
};

const hasValue = (value: HistoryValue) =>
  value !== null && value !== undefined && String(value).trim() !== '';

const HistoryFieldValues = ({ field }: { field: HistoryField }) => {
  const isChanged =
    hasValue(field.oldValue) && hasValue(field.newValue) && field.oldValue !== field.newValue;

  if (!hasValue(field.newValue)) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {isChanged && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <Typography
            element="div"
            category="body"
            proportions="m"
            className="text-(--color-text-secondary)"
          >
            {field.oldLabel}
          </Typography>
          <Typography
            element="div"
            category="body"
            proportions="m"
            className="max-w-60 text-right break-words text-(--color-text-secondary)"
          >
            {String(field.oldValue)}
          </Typography>
        </div>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <Typography
          element="div"
          category="body"
          proportions="m"
          className="text-(--color-text-secondary)"
        >
          {field.newLabel}
        </Typography>
        <Typography
          element="div"
          category="body"
          proportions="mStrong"
          className="max-w-60 text-right wrap-break-word text-(--color-text-primary)"
        >
          {String(field.newValue)}
        </Typography>
      </div>
    </div>
  );
};

const HistoryGroupValues = ({ group }: { group: HistoryGroup }) => {
  const visibleFields = group.fields.filter((field) => hasValue(field.newValue));

  if (visibleFields.length === 0) return null;

  return (
    <div className="flex items-start gap-3">
      <div aria-hidden className="flex size-5 shrink-0 items-center justify-center">
        {group.marker}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {visibleFields.map((field) => (
          <HistoryFieldValues key={field.label} field={field} />
        ))}
      </div>
    </div>
  );
};

export const StockAssetHistoryDetailsModal = ({
  historyId,
  onClose,
}: StockAssetHistoryDetailsModalProps) => {
  const { history, isError, isLoading } = useStockAssetHistoryDetails(historyId ?? undefined);
  const price = (value: number | undefined) =>
    value === undefined ? undefined : formatMoney(value, { currency: history?.currency });

  const groups: HistoryGroup[] = history
    ? [
        {
          marker: '₽',
          fields: [
            {
              label: 'Цена',
              oldLabel: 'Старая цена',
              newLabel: 'Новая цена',
              oldValue: price(history.old_price),
              newValue: price(history.new_price),
            },
          ],
        },
        {
          marker: (
            <OutlineSystemAlertCircle
              width="20"
              height="20"
              className="fill-(--color-text-secondary)"
            />
          ),
          fields: [
            {
              label: 'Название',
              oldLabel: 'Старое название',
              newLabel: 'Новое название',
              oldValue: history.old_name,
              newValue: history.new_name,
            },
            {
              label: 'Инвентарный номер',
              oldLabel: 'Старый инвентарный номер',
              newLabel: 'Новый инвентарный номер',
              oldValue: history.old_inventory_number,
              newValue: history.new_inventory_number ?? history.inventory_number,
            },
            {
              label: 'Серийный номер',
              oldLabel: 'Старый серийный номер',
              newLabel: 'Новый серийный номер',
              oldValue: history.old_serial_number,
              newValue: history.new_serial_number ?? history.serial_number,
            },
            {
              label: 'Категория',
              oldLabel: 'Старая категория',
              newLabel: 'Новая категория',
              oldValue: history.old_alif_category,
              newValue: history.new_alif_category,
            },
            {
              label: 'Статус',
              oldLabel: 'Старый статус',
              newLabel: 'Новый статус',
              oldValue: history.old_status,
              newValue: history.new_status,
            },
          ],
        },
        {
          marker: '◯',
          fields: [
            {
              label: 'Сотрудник',
              oldLabel: 'Старый сотрудник',
              newLabel: 'Новый сотрудник',
              oldValue: history.old_employee,
              newValue: history.new_employee,
            },
            {
              label: 'Ответственное лицо',
              oldLabel: 'Старое ответственное лицо',
              newLabel: 'Новое ответственное лицо',
              oldValue: history.old_responsible_person,
              newValue: history.new_responsible_person,
            },
            {
              label: 'Заведующий складом',
              oldLabel: 'Старый заведующий складом',
              newLabel: 'Новый заведующий складом',
              oldValue: history.old_warehouse_manager,
              newValue: history.new_warehouse_manager,
            },
          ],
        },
        {
          marker: '⌖',
          fields: [
            {
              label: 'Здание',
              oldLabel: 'Старое здание',
              newLabel: 'Новое здание',
              oldValue: history.old_subdivision,
              newValue: history.new_subdivision,
            },
            {
              label: 'Кабинет',
              oldLabel: 'Старый кабинет',
              newLabel: 'Новый кабинет',
              oldValue: history.old_room,
              newValue: history.new_room,
            },
            {
              label: 'Город',
              oldLabel: 'Старый город',
              newLabel: 'Новый город',
              oldValue: history.old_department,
              newValue: history.new_department,
            },
          ],
        },
        {
          marker: '□',
          fields: [
            {
              label: 'Комментарий',
              oldLabel: 'Старый комментарий',
              newLabel: 'Новый комментарий',
              oldValue: history.old_comment,
              newValue: history.new_comment,
            },
          ],
        },
      ]
    : [];

  return (
    <Modal
      className="w-[500px] max-w-[calc(100vw-32px)]"
      isOpen={historyId !== null}
      onClose={onClose}
      isCentered
      withCloseButton
    >
      <Modal.Header title="История изменений" />
      <Modal.Content className="max-h-[70vh] overflow-y-auto">
        {isLoading && (
          <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
            Загрузка истории…
          </Typography>
        )}
        {isError && (
          <Typography category="body" proportions="s" className="text-(--color-danger)">
            Не удалось загрузить запись истории.
          </Typography>
        )}
        {history && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <Typography
                  element="div"
                  category="body"
                  proportions="m"
                  className="text-(--color-text-secondary)"
                >
                  Время изменения:
                </Typography>
                <Typography
                  element="div"
                  category="body"
                  proportions="m"
                  className="text-right text-(--color-text-primary)"
                >
                  {formatDate(history.date, 'ru', { withTime: true })}
                </Typography>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <Typography
                  element="div"
                  category="body"
                  proportions="m"
                  className="text-(--color-text-secondary)"
                >
                  Инициатор:
                </Typography>
                <Typography
                  element="div"
                  category="body"
                  proportions="m"
                  className="text-right text-(--color-text-primary)"
                >
                  {history.initiator || '—'}
                </Typography>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <Typography
                  element="div"
                  category="body"
                  proportions="m"
                  className="text-(--color-text-secondary)"
                >
                  Тип изменения:
                </Typography>
                <Typography
                  element="div"
                  category="body"
                  proportions="m"
                  className="text-right text-(--color-text-primary)"
                >
                  {history.operation_type || '—'}
                </Typography>
              </div>
            </div>
            {groups.map((group, index) => (
              <HistoryGroupValues key={index} group={group} />
            ))}
            {hasValue(history.description) && (
              <div className="flex items-start gap-3">
                <Typography
                  element="div"
                  category="body"
                  proportions="sStrong"
                  className="flex size-5 shrink-0 items-center justify-center text-(--color-text-disabled)"
                >
                  □
                </Typography>
                <div>
                  <Typography
                    element="div"
                    category="body"
                    proportions="xsStrong"
                    className="text-(--color-text-disabled)"
                  >
                    Описание
                  </Typography>
                  <Typography
                    element="div"
                    category="body"
                    proportions="s"
                    className="mt-0.5 whitespace-pre-wrap text-(--color-text-body)"
                  >
                    {history.description}
                  </Typography>
                </div>
              </div>
            )}
            {hasValue(history.last_image_update) && (
              <div>
                <Typography
                  element="div"
                  category="body"
                  proportions="xsStrong"
                  className="text-(--color-text-disabled)"
                >
                  Обновление изображения
                </Typography>
                <Typography
                  element="div"
                  category="body"
                  proportions="s"
                  className="mt-0.5 text-(--color-text-body)"
                >
                  {history.last_image_update}
                </Typography>
              </div>
            )}
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
};
