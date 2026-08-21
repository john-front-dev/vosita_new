import { Surface, Typography } from 'alif-ui';
import { Link } from 'react-router-dom';

import type { StockAsset, StockAssetType } from '@entities/stock-asset';
import { routes } from '@shared/config';
import { formatMoney } from '@shared/lib';

type StockAssetDescriptionProps = {
  asset: StockAsset;
  type: StockAssetType;
};

const Row = ({ label, to, value }: { label: string; to?: string; value?: number | string }) => (
  <div className="flex items-start justify-between gap-6 border-b border-(--color-border-default) pb-3 last:border-b-0">
    <Typography
      element="span"
      category="body"
      proportions="sStrong"
      className="text-(--color-text-secondary)"
    >
      {label}
    </Typography>
    {to && value ? (
      <Link className="max-w-[58%] text-right wrap-anywhere hover:underline" to={to}>
        <Typography
          element="span"
          category="body"
          proportions="sStrong"
          color="var(--color-primary)"
        >
          {value}
        </Typography>
      </Link>
    ) : (
      <Typography
        element="span"
        category="body"
        proportions="sStrong"
        className="max-w-[58%] text-right wrap-anywhere text-(--color-text-primary)"
      >
        {value || '-'}
      </Typography>
    )}
  </div>
);

const Group = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div>
    <Typography
      element="div"
      category="body"
      proportions="mStrong"
      className="mb-1 text-(--color-text-body)"
    >
      {title}
    </Typography>
    <div>{children}</div>
  </div>
);

export const StockAssetDescription = ({ asset, type }: StockAssetDescriptionProps) => (
  <Surface className="flex flex-col gap-6" p="5" rounded="12">
    <Row label="ID заявки с этим объектом" value={asset.application_id} />
    <Group title="Стоимость">
      <Row label={`Цена (${asset.currency ?? '-'})`} value={formatMoney(asset.price)} />
    </Group>
    <Group title="Сведения">
      <Row label="Наименование" value={asset.name} />
      <Row label="Серийный номер" value={asset.serial_number} />
      {type === 'fixed-assets' && <Row label="Инвентарный номер" value={asset.inventory_number} />}
      <Row label="Категория" value={asset.category?.name ?? asset.category_name} />
      {type === 'fixed-assets' && <Row label="Группа налога" value={asset.category?.tax_group} />}
    </Group>
    <Group title="Пользователи">
      <Row
        label="Ответственное лицо"
        value={asset.responsible_person}
        to={
          asset.responsible_person_id
            ? routes.employeeDetails.replace(':id', String(asset.responsible_person_id))
            : undefined
        }
      />
      {(asset.status_id === 3 || asset.status_id === 19) && (
        <Row
          label="Пользователь"
          value={asset.exploiter}
          to={
            asset.exploiter_id
              ? routes.employeeDetails.replace(':id', String(asset.exploiter_id))
              : undefined
          }
        />
      )}
    </Group>
    <Group title="Расположение">
      <Row label="Кабинет" value={asset.cabinet} />
      <Row label="Здание" value={asset.building} />
      <Row label="Город" value={asset.city} />
    </Group>
  </Surface>
);
