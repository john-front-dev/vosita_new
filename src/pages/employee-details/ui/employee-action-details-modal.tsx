import { Loader, Modal, Typography } from 'alif-ui';

import { formatDate } from '@shared/lib';
import { DetailsRow } from '@shared/ui';

import {
  type EmployeeActionDetails,
  useEmployeeActionDetails,
} from '../model/use-employee-action-details';

type Props = { actionId: number | null; onClose: () => void };
type DetailValue = number | string | null | undefined;

const hasValue = (value: DetailValue) =>
  value !== null && value !== undefined && String(value).trim() !== '';

const firstValue = (...values: DetailValue[]) => values.find(hasValue);

const getRows = (action: EmployeeActionDetails) =>
  [
    { label: 'ID', value: action.id },
    { label: 'Пользователь', value: action.initiator },
    {
      label: 'Время изменения',
      value: action.date ? formatDate(action.date, 'ru', { withTime: true }) : undefined,
    },
    { label: 'Наименование', value: firstValue(action.new_name, action.old_name) },
    { label: 'Цена', value: action.new_price },
    { label: 'Инвентарный номер', value: action.inventory_number },
    { label: 'Тип', value: action.operation_type },
    { label: 'Категория', value: action.new_alif_category },
    { label: 'Филиал', value: action.new_department },
    {
      label: 'Сотрудник',
      value: firstValue(
        action.new_employee,
        action.old_employee,
        action.new_employee_uuid,
        action.old_employee_uuid,
      ),
    },
    {
      label: 'Заведующий складом',
      value: firstValue(action.new_warehouse_manager, action.old_warehouse_manager),
    },
    { label: 'Ответственное лицо', value: action.old_responsible_person },
    { label: 'Кабинет', value: firstValue(action.new_room, action.old_room) },
    { label: 'Статус', value: firstValue(action.new_status, action.old_status) },
    { label: 'Здание', value: action.new_subdivision },
    { label: 'Комментарий', value: firstValue(action.new_comment, action.old_comment) },
    { label: 'Описание', value: action.description },
  ].filter((row) => hasValue(row.value));

export const EmployeeActionDetailsModal = ({ actionId, onClose }: Props) => {
  const { action, isError, isLoading } = useEmployeeActionDetails(actionId);
  const rows = action ? getRows(action) : [];

  return (
    <Modal
      className="w-140"
      isOpen={actionId !== null}
      onClose={onClose}
      isCentered
      withCloseButton
    >
      <Modal.Header title={action?.operation_type || 'История события'} />
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
        {rows.map((row) => (
          <DetailsRow key={row.label} label={row.label} value={row.value ?? undefined} />
        ))}
      </Modal.Content>
    </Modal>
  );
};
