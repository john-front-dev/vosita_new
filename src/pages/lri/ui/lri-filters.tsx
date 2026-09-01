import { useMemo, useState } from 'react';
import { Button, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';

import { useBuildings, useCities } from '@entities/location';
import { normalizeSelectValue } from '@shared/lib';

import type { LriFilters as LriFiltersValues } from '../model/lri-filters';

type LriFiltersProps = {
  filters: LriFiltersValues;
  isOpen: boolean;
  onApply: (filters: LriFiltersValues) => void;
  onClick: () => void;
  onClose: () => void;
};

const LriFiltersModal = ({
  filters,
  onApply,
  onClose,
}: Omit<LriFiltersProps, 'isOpen' | 'onClick'>) => {
  const [localFilters, setLocalFilters] = useState<LriFiltersValues>(filters);
  const citiesQuery = useCities();
  const buildingsQuery = useBuildings(localFilters.CITY_ID[0]);
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

  return (
    <Modal
      className="w-150"
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
            setLocalFilters((previous) => ({
              ...previous,
              CITY_ID: cityId ? [cityId] : [],
              BUILDING_ID: [],
            }));
          }}
          fullWidth
          isLoading={citiesQuery.isLoading || citiesQuery.isFetching}
        />
        <Select
          label="Здание"
          value={localFilters.BUILDING_ID[0] || null}
          options={buildingOptions}
          onChange={(value) => {
            const buildingId = normalizeSelectValue(value);
            setLocalFilters((previous) => ({
              ...previous,
              BUILDING_ID: buildingId ? [buildingId] : [],
            }));
          }}
          fullWidth
          disabled={!localFilters.CITY_ID.length}
          isLoading={buildingsQuery.isLoading || buildingsQuery.isFetching}
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

export const LriFilters = ({ filters, isOpen, onApply, onClick, onClose }: LriFiltersProps) => (
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
    {isOpen && <LriFiltersModal filters={filters} onApply={onApply} onClose={onClose} />}
  </>
);
