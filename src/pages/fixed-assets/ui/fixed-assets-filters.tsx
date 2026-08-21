import { useMemo, useState } from 'react';
import { Button, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';

import { useCategories } from '@entities/category';
import { useBuildings, useCabinets, useCities } from '@entities/location';
import { normalizeSelectValue } from '@shared/lib';

import type { FixedAssetsFilters as FixedAssetsFiltersValues } from '../model/fixed-assets-filters';

type FixedAssetsFiltersProps = {
  filters: FixedAssetsFiltersValues;
  isOpen: boolean;
  onApply: (filters: FixedAssetsFiltersValues) => void;
  onClick: () => void;
  onClose: () => void;
};

const inventoryOptions = [
  { label: 'Инвентаризирован', value: 'true' },
  { label: 'Не инвентаризирован', value: 'false' },
];

type FixedAssetsFiltersModalProps = Pick<
  FixedAssetsFiltersProps,
  'filters' | 'onApply' | 'onClose'
>;

const FixedAssetsFiltersModal = ({ filters, onApply, onClose }: FixedAssetsFiltersModalProps) => {
  const [localFilters, setLocalFilters] = useState<FixedAssetsFiltersValues>(filters);

  const citiesQuery = useCities();
  const categoriesQuery = useCategories();
  const buildingsQuery = useBuildings(localFilters.CITY_ID[0]);
  const cabinetsQuery = useCabinets(localFilters.BUILDING_ID[0]);

  const cityOptions = useMemo(
    () => citiesQuery.cities.map((city) => ({ label: city.name, value: String(city.id) })),
    [citiesQuery.cities],
  );
  const buildingOptions = useMemo(
    () =>
      buildingsQuery.buildings.map((building) => ({
        label: building.name ?? building.build ?? '-',
        value: String(building.id),
      })),
    [buildingsQuery.buildings],
  );
  const cabinetOptions = useMemo(
    () =>
      cabinetsQuery.cabinets.map((cabinet) => ({ label: cabinet.room, value: String(cabinet.id) })),
    [cabinetsQuery.cabinets],
  );

  return (
    <Modal
      className="w-150 max-w-[calc(100vw-32px)]"
      isOpen
      onClose={onClose}
      isCentered
      withCloseButton
      isCloseOutside={false}
    >
      <Modal.Header title="Фильтрация списка" />
      <Modal.Content className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Город"
          value={localFilters.CITY_ID[0] || null}
          options={cityOptions}
          onChange={(value) => {
            const cityId = normalizeSelectValue(value);

            setLocalFilters((previousFilters) => ({
              ...previousFilters,
              BUILDING_ID: [],
              CABINET_ID: [],
              CITY_ID: cityId ? [cityId] : [],
            }));
          }}
          fullWidth
          isLoading={citiesQuery.isLoading || citiesQuery.isFetching}
            proportions="m"
        />
        <Select
          label="Здание"
          value={localFilters.BUILDING_ID[0] || null}
          options={buildingOptions}
          onChange={(value) => {
            const buildingId = normalizeSelectValue(value);

            setLocalFilters((previousFilters) => ({
              ...previousFilters,
              BUILDING_ID: buildingId ? [buildingId] : [],
              CABINET_ID: [],
            }));
          }}
          fullWidth
          isLoading={buildingsQuery.isLoading || buildingsQuery.isFetching}
          disabled={!localFilters.CITY_ID.length}
            proportions="m"
        />
        <Select
          label="Категория"
          value={localFilters.CATEGORY_ID[0] || null}
          options={categoriesQuery.categories.map((category) => ({
            label: category.name,
            value: String(category.id),
          }))}
          onChange={(value) => {
            const categoryId = normalizeSelectValue(value);

            setLocalFilters((previousFilters) => ({
              ...previousFilters,
              CATEGORY_ID: categoryId ? [categoryId] : [],
            }));
          }}
          fullWidth
          isLoading={categoriesQuery.isLoading || categoriesQuery.isFetching}
            proportions="m"
        />
        <Select
          label="Кабинет"
          value={localFilters.CABINET_ID[0] || null}
          options={cabinetOptions}
          onChange={(value) => {
            const cabinetId = normalizeSelectValue(value);

            setLocalFilters((previousFilters) => ({
              ...previousFilters,
              CABINET_ID: cabinetId ? [cabinetId] : [],
            }));
          }}
          fullWidth
          isLoading={cabinetsQuery.isLoading || cabinetsQuery.isFetching}
          disabled={!localFilters.BUILDING_ID.length}
            proportions="m"
        />
        <Select
          label="Инвентаризирован"
          value={localFilters.IS_INVENTORIED[0] || null}
          options={inventoryOptions}
          onChange={(value) => {
            const isInventoried = normalizeSelectValue(value);

            setLocalFilters((previousFilters) => ({
              ...previousFilters,
              IS_INVENTORIED: isInventoried ? [isInventoried] : [],
            }));
          }}
          fullWidth
            proportions="m"
        />
      </Modal.Content>
      <Modal.Actions className="flex justify-end">
        <div className="flex gap-2">
          <Button type="button" variant="outline-neutral" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" variant="primary" onClick={() => onApply(localFilters)}>
            Применить
          </Button>
        </div>
      </Modal.Actions>
    </Modal>
  );
};

export const FixedAssetsFilters = ({
  filters,
  isOpen,
  onApply,
  onClick,
  onClose,
}: FixedAssetsFiltersProps) => (
  <>
    <Button
      type="button"
      variant="outline-neutral"
      size="l"
      leftSection={<OutlineSystemFilterFromLessToMore />}
      onClick={onClick}
    >
      Фильтр
    </Button>
    {isOpen && <FixedAssetsFiltersModal filters={filters} onApply={onApply} onClose={onClose} />}
  </>
);
