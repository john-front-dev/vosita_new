import { useMemo, useState } from 'react';
import { Button, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';

import { useCategories } from '@entities/category';
import { useEmployees } from '@entities/employee';
import { useBuildings, useCities } from '@entities/location';
import { normalizeSelectValue } from '@shared/lib';

import {
  type OthersFilters as OthersFiltersValues,
  othersRepairOptions,
  othersStatusOptions,
} from '../model/others-filters';

type OthersFiltersProps = {
  filters: OthersFiltersValues;
  isOpen: boolean;
  onApply: (filters: OthersFiltersValues) => void;
  onClick: () => void;
  onClose: () => void;
};

const toOptions = (records: Array<{ full_name: string; id: number | string }>) =>
  records.map((record) => ({ label: record.full_name, value: String(record.id) }));

export const OthersFilters = ({
  filters,
  isOpen,
  onApply,
  onClick,
  onClose,
}: OthersFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<OthersFiltersValues>(filters);
  const [managerSearch, setManagerSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [responsibleSearch, setResponsibleSearch] = useState('');
  const [exploiterSearch, setExploiterSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [buildingSearch, setBuildingSearch] = useState('');
  const {
    employees: warehouseManagers,
    isFetching: isManagersFetching,
    isLoading: isManagersLoading,
  } = useEmployees(managerSearch, isOpen, '3,4');
  const {
    categories,
    isFetching: isCategoriesFetching,
    isLoading: isCategoriesLoading,
  } = useCategories(categorySearch, isOpen);
  const {
    employees: responsiblePeople,
    isFetching: isResponsibleFetching,
    isLoading: isResponsibleLoading,
  } = useEmployees(responsibleSearch, isOpen, '1,4');
  const {
    employees: exploiters,
    isFetching: isExploitersFetching,
    isLoading: isExploitersLoading,
  } = useEmployees(exploiterSearch, isOpen);
  const { cities, isFetching: isCitiesFetching, isLoading: isCitiesLoading } = useCities(
    citySearch,
    isOpen,
  );
  const { buildings, isFetching: isBuildingsFetching, isLoading: isBuildingsLoading } =
    useBuildings(localFilters.CITY_ID[0], buildingSearch, isOpen);

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
  const setFilter = (key: keyof OthersFiltersValues, value: unknown) => {
    const normalizedValue = normalizeSelectValue(value);

    setLocalFilters((previousFilters) => ({
      ...previousFilters,
      [key]: normalizedValue ? [normalizedValue] : [],
    }));
  };

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
          className="w-180"
          isOpen
          onClose={onClose}
          isCentered
          withCloseButton
          isCloseOutside={false}
        >
          <Modal.Header title="Фильтрация списка" />
          <Modal.Content className="grid grid-cols-2 gap-4">
            <Select
              label="Заведующий складом"
              value={localFilters.WAREHOUSE_MANAGER_ID[0] || null}
              options={toOptions(warehouseManagers)}
              onChange={(value) => setFilter('WAREHOUSE_MANAGER_ID', value)}
              hasSearch
              searchValue={managerSearch}
              onSearchList={setManagerSearch}
              disableClientFilter
              isLoading={isManagersLoading || isManagersFetching}
              fullWidth
            />
            <Select
              label="Категория"
              value={localFilters.CATEGORY_ID[0] || null}
              options={categories.map((category) => ({
                label: category.name,
                value: String(category.id),
              }))}
              onChange={(value) => setFilter('CATEGORY_ID', value)}
              hasSearch
              searchValue={categorySearch}
              onSearchList={setCategorySearch}
              disableClientFilter
              isLoading={isCategoriesLoading || isCategoriesFetching}
              fullWidth
            />
            <Select
              label="Ответственное лицо"
              value={localFilters.RESPONSIBLE_PERSON_ID[0] || null}
              options={toOptions(responsiblePeople)}
              onChange={(value) => setFilter('RESPONSIBLE_PERSON_ID', value)}
              hasSearch
              searchValue={responsibleSearch}
              onSearchList={setResponsibleSearch}
              disableClientFilter
              isLoading={isResponsibleLoading || isResponsibleFetching}
              fullWidth
            />
            <Select
              label="Пользователь"
              value={localFilters.EXPLOITER_ID[0] || null}
              options={toOptions(exploiters)}
              onChange={(value) => setFilter('EXPLOITER_ID', value)}
              hasSearch
              searchValue={exploiterSearch}
              onSearchList={setExploiterSearch}
              disableClientFilter
              isLoading={isExploitersLoading || isExploitersFetching}
              fullWidth
            />
            <Select
              label="Город"
              value={localFilters.CITY_ID[0] || null}
              options={cityOptions}
              onChange={(value) => {
                const cityId = normalizeSelectValue(value);

                setLocalFilters((previousFilters) => ({
                  ...previousFilters,
                  BUILDING_ID: [],
                  CITY_ID: cityId ? [cityId] : [],
                }));
              }}
              hasSearch
              searchValue={citySearch}
              onSearchList={setCitySearch}
              disableClientFilter
              isLoading={isCitiesLoading || isCitiesFetching}
              fullWidth
            />
            <Select
              label="Здание"
              value={localFilters.BUILDING_ID[0] || null}
              options={buildingOptions}
              onChange={(value) => setFilter('BUILDING_ID', value)}
              hasSearch
              searchValue={buildingSearch}
              onSearchList={setBuildingSearch}
              disableClientFilter
              isLoading={isBuildingsLoading || isBuildingsFetching}
              disabled={!localFilters.CITY_ID.length}
              fullWidth
            />
            <Select
              label="Статус"
              value={localFilters.STATUS_ID[0] || null}
              options={othersStatusOptions}
              onChange={(value) => setFilter('STATUS_ID', value)}
              fullWidth
            />
            <Select
              label="Статус ремонта"
              value={localFilters.REPAIR[0] || null}
              options={othersRepairOptions}
              onChange={(value) => setFilter('REPAIR', value)}
              fullWidth
            />
          </Modal.Content>
          <Modal.Actions className="flex justify-end gap-2">
            <Button type="button" variant="outline-neutral" onClick={onClose}>
              Отмена
            </Button>
            <Button type="button" variant="primary" onClick={() => onApply(localFilters)}>
              Применить
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
};
