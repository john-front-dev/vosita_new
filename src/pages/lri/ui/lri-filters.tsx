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

export const LriFilters = ({ filters, isOpen, onApply, onClick, onClose }: LriFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<LriFiltersValues>(filters);
  const {
    cities,
    isFetching: isCitiesFetching,
    isLoading: isCitiesLoading,
  } = useCities('', isOpen);
  const {
    buildings,
    isFetching: isBuildingsFetching,
    isLoading: isBuildingsLoading,
  } = useBuildings(localFilters.CITY_ID[0], '', isOpen);
  const cityOptions = useMemo(
    () => cities.map((city) => ({ label: city.name, value: String(city.id) })),
    [cities],
  );
  const buildingOptions = useMemo(
    () =>
      buildings.map((building) => ({
        label: building.name ?? building.build ?? '-',
        value: String(building.id),
      })),
    [buildings],
  );

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        size="l"
        leftSection={<OutlineSystemFilterFromLessToMore />}
        onClick={() => {
          setLocalFilters(filters);
          onClick();
        }}
      >
        Фильтр
      </Button>
      {isOpen && (
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
              isLoading={isCitiesLoading || isCitiesFetching}
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
              isLoading={isBuildingsLoading || isBuildingsFetching}
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
      )}
    </>
  );
};
