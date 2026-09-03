import { useState } from 'react';
import { Modal, Surface } from 'alif-ui';

import {
  isOsLikeStockAssetType,
  type StockAsset,
  type StockAssetType,
} from '@entities/stock-asset';
import { routes } from '@shared/config';
import { formatMoney } from '@shared/lib';
import { DetailsGroup, DetailsRow } from '@shared/ui';

type StockAssetDescriptionProps = {
  asset: StockAsset;
  type: StockAssetType;
};

export const StockAssetDescription = ({ asset, type }: StockAssetDescriptionProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const isOsLike = isOsLikeStockAssetType(type);
  const images = asset.images?.filter(Boolean) ?? [];

  return (
    <>
      <Surface className="flex flex-col gap-6" p="5" rounded="12">
        <DetailsRow label="ID заявки с этим объектом" value={asset.application_id} />
        <DetailsGroup title="Стоимость">
          <DetailsRow label={`Цена (${asset.currency ?? '-'})`} value={formatMoney(asset.price)} />
        </DetailsGroup>
        <DetailsGroup title="Сведения">
          <DetailsRow label="Наименование" value={asset.name} />
          <DetailsRow label="Серийный номер" value={asset.serial_number} />
          {isOsLike && <DetailsRow label="Инвентарный номер" value={asset.inventory_number} />}
          <DetailsRow label="Категория" value={asset.category?.name ?? asset.category_name} />
          {isOsLike && <DetailsRow label="Группа налога" value={asset.category?.tax_group} />}
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
        {images.length > 0 && (
          <DetailsGroup title="Изображения">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  className="overflow-hidden rounded-lg border border-(--color-border-default) bg-(--color-bg-subtle)"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    className="aspect-square w-full object-cover"
                    src={image}
                    alt={asset.name}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </DetailsGroup>
        )}
      </Surface>
      <Modal
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        isCentered
        withCloseButton
      >
        <Modal.Header title="Изображение объекта" />
        <Modal.Content>
          {selectedImage && (
            <img
              className="max-h-[75vh] w-full object-contain"
              src={selectedImage}
              alt={asset.name}
            />
          )}
        </Modal.Content>
      </Modal>
    </>
  );
};
