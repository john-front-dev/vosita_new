import { Surface } from 'alif-ui';

import type { StockAsset, StockAssetType } from '@entities/stock-asset';
import { routes } from '@shared/config';
import { formatMoney } from '@shared/lib';
import { DetailsGroup, DetailsRow } from '@shared/ui';

type StockAssetDescriptionProps = {
  asset: StockAsset;
  type: StockAssetType;
};

export const StockAssetDescription = ({ asset, type }: StockAssetDescriptionProps) => (
  <Surface className="flex flex-col gap-6" p="5" rounded="12">
    <DetailsRow label="ID заявки с этим объектом" value={asset.application_id} />
    <DetailsGroup title="Стоимость">
      <DetailsRow label={`Цена (${asset.currency ?? '-'})`} value={formatMoney(asset.price)} />
    </DetailsGroup>
    <DetailsGroup title="Сведения">
      <DetailsRow label="Наименование" value={asset.name} />
      <DetailsRow label="Серийный номер" value={asset.serial_number} />
      {type === 'fixed-assets' && (
        <DetailsRow label="Инвентарный номер" value={asset.inventory_number} />
      )}
      <DetailsRow label="Категория" value={asset.category?.name ?? asset.category_name} />
      {type === 'fixed-assets' && (
        <DetailsRow label="Группа налога" value={asset.category?.tax_group} />
      )}
    </DetailsGroup>
    <DetailsGroup title="Пользователи">
      <DetailsRow
        label="Ответственное лицо"
        value={asset.responsible_person}
        to={
          asset.responsible_person_id
            ? routes.employeeDetails.replace(':id', String(asset.responsible_person_id))
            : undefined
        }
      />
      {(asset.status_id === 3 || asset.status_id === 19) && (
        <DetailsRow
          label="Пользователь"
          value={asset.exploiter}
          to={
            asset.exploiter_id
              ? routes.employeeDetails.replace(':id', String(asset.exploiter_id))
              : undefined
          }
        />
      )}
    </DetailsGroup>
    <DetailsGroup title="Расположение">
      <DetailsRow label="Кабинет" value={asset.cabinet} />
      <DetailsRow label="Здание" value={asset.building} />
      <DetailsRow label="Город" value={asset.city} />
    </DetailsGroup>
  </Surface>
);
