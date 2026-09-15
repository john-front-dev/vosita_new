import { Loader, Modal, Typography } from 'alif-ui';

import { formatDate } from '@shared/lib';
import { DetailsRow } from '@shared/ui';

import type { HistoryDetails } from '../model/types';
import { useHistoryDetails } from '../model/use-history-details';

type HistoryDetailsModalProps = {
  historyId: number | null;
  onClose: () => void;
};

type HistoryValue = number | string | null | undefined;

const hasValue = (value: HistoryValue) =>
  value !== null && value !== undefined && String(value).trim() !== '';

const firstValue = (...values: HistoryValue[]) => values.find(hasValue);

const getDetailsRows = (history: HistoryDetails) =>
  [
    { label: 'ID', value: history.id },
    { label: 'Пользователь', value: history.initiator },
    {
      label: 'Время изменения',
      value: history.date ? formatDate(history.date, 'ru', { withTime: true }) : undefined,
    },
    { label: 'Наименование', value: firstValue(history.new_name, history.old_name) },
    { label: 'Цена', value: history.new_price },
    { label: 'Инвентарный номер', value: history.inventory_number },
    { label: 'Тип', value: history.operation_type },
    { label: 'Категория', value: history.new_alif_category },
    { label: 'Филиал', value: history.new_department },
    {
      label: 'Сотрудник',
      value: firstValue(
        history.new_employee,
        history.old_employee,
        history.new_employee_uuid,
        history.old_employee_uuid,
      ),
    },
    {
      label: 'Заведующий складом',
      value: firstValue(
        history.new_warehouse_manager,
        history.old_warehouse_manager,
        history.new_warhouse_manager_id,
        history.old_warhouse_manager_id,
      ),
    },
    { label: 'Ответственное лицо', value: history.old_responsible_person },
    { label: 'Кабинет', value: firstValue(history.new_room, history.old_room) },
    { label: 'Статус', value: firstValue(history.new_status, history.old_status) },
    { label: 'Здание', value: history.new_subdivision },
    { label: 'Комментарий', value: firstValue(history.new_comment, history.old_comment) },
    { label: 'Описание', value: history.description },
  ].filter((row) => hasValue(row.value));

export const HistoryDetailsModal = ({ historyId, onClose }: HistoryDetailsModalProps) => {
  const { history, isError, isLoading } = useHistoryDetails(historyId);
  const rows = history ? getDetailsRows(history) : [];

  return (
    <Modal
      className="w-140"
      isOpen={historyId !== null}
      onClose={onClose}
      isCentered
      withCloseButton
    >
      <Modal.Header title={history?.operation_type || 'История события'} />
      <Modal.Content className="max-h-[70vh] overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        )}
        {isError && (
          <Typography category="body" proportions="s" className="text-(--color-danger)">
            Не удалось загрузить событие.
          </Typography>
        )}
        {history &&
          rows.map((row) => (
            <DetailsRow key={row.label} label={row.label} value={row.value ?? undefined} />
          ))}
      </Modal.Content>
    </Modal>
  );
};
