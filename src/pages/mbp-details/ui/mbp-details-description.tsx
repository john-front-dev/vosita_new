import { Surface } from 'alif-ui';

import type { MbpDetails } from '@entities/mbp';
import { routes } from '@shared/config';
import { formatDate, formatMoney } from '@shared/lib';
import { DetailsGroup, DetailsRow } from '@shared/ui';

export const MbpDetailsDescription = ({ mbp }: { mbp: MbpDetails }) => (
  <Surface className="flex flex-col gap-6" p="5" rounded="12">
    <DetailsGroup title="Сведения">
      <DetailsRow label="Наименование" value={mbp.name} />
      <DetailsRow label="Инвентарный номер" value={mbp.inventory_number} />
      <DetailsRow label="Серийный номер" value={mbp.serial_number} />
      <DetailsRow label="Категория" value={mbp.category_name} />
      <DetailsRow label="Количество" value={mbp.quantity} />
      <DetailsRow label="Единица измерения" value={mbp.unit} />
    </DetailsGroup>
    <DetailsGroup title="Стоимость">
      <DetailsRow label={`Цена (${mbp.currency || '-'})`} value={formatMoney(mbp.price)} />
    </DetailsGroup>
    <DetailsGroup title="Ответственный">
      <DetailsRow
        label="Ответственное лицо"
        value={mbp.responsible_name}
        to={
          mbp.responsible_id
            ? routes.employeeDetails.replace(':id', String(mbp.responsible_id))
            : undefined
        }
      />
    </DetailsGroup>
    <DetailsGroup title="Расположение">
      <DetailsRow label="Город" value={mbp.department_name} />
      <DetailsRow label="Здание" value={mbp.subdivision_name} />
      <DetailsRow label="Склад" value={mbp.storage_name} />
      <DetailsRow label="Кабинет" value={mbp.rooms_name} />
    </DetailsGroup>
    <DetailsGroup title="Даты">
      <DetailsRow label="Дата покупки" value={formatDate(mbp.purchase_date)} />
      <DetailsRow label="Дата создания" value={formatDate(mbp.created_at)} />
      <DetailsRow label="Дата обновления" value={formatDate(mbp.updated_at)} />
    </DetailsGroup>
  </Surface>
);
