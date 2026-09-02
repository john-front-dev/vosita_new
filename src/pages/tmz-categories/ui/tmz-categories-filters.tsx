import { useMemo, useState } from 'react';
import { Button, Modal, OutlineSystemFilterFromLessToMore, Select, Switch } from 'alif-ui';

import { useTmzCategoryOptions } from '@entities/category';
import { useBuildings, useCities } from '@entities/location';
import { normalizeSelectValue } from '@shared/lib';

import type { TmzCategoriesFilters as TmzCategoriesFiltersValues } from '../model/tmz-categories-filters';

type TmzCategoriesFiltersProps = {
  filters: TmzCategoriesFiltersValues;
  isOpen: boolean;
  onApply: (filters: TmzCategoriesFiltersValues) => void;
  onClick: () => void;
  onClose: () => void;
};

type TmzCategoriesFiltersModalProps = Pick<
  TmzCategoriesFiltersProps,
  'filters' | 'onApply' | 'onClose'
>;

const TmzCategoriesFiltersModal = ({
  filters,
  onApply,
  onClose,
}: TmzCategoriesFiltersModalProps) => {
  const [localFilters, setLocalFilters] = useState<TmzCategoriesFiltersValues>(filters);
  const { cities, isFetching: isCitiesFetching, isLoading: isCitiesLoading } = useCities();
  const { buildings, isFetching: isBuildingsFetching, isLoading: isBuildingsLoading } =
    useBuildings(localFilters.CITY_ID[0]);
  const {
    categories,
    isFetching: isCategoriesFetching,
    isLoading: isCategoriesLoading,
  } = useTmzCategoryOptions();

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

            setLocalFilters((previousFilters) => ({
              ...previousFilters,
              BUILDING_ID: [],
              CITY_ID: cityId ? [cityId] : [],
            }));
          }}
          fullWidth
          isLoading={isCitiesLoading || isCitiesFetching}
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
            }));
          }}
          fullWidth
          isLoading={isBuildingsLoading || isBuildingsFetching}
          disabled={!localFilters.CITY_ID.length}
          proportions="m"
        />
        <Select
          label="Категория"
          value={localFilters.CATEGORY_ID[0] || null}
          options={categories.map((category) => ({
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
          isLoading={isCategoriesLoading || isCategoriesFetching}
          proportions="m"
        />
        <div className="flex items-center pt-5">
          <Switch
            label="Показать нулевые остатки"
            size="m"
            checked={localFilters.WITH_ZEROS[0] === 'true'}
            onChange={(event) =>
              setLocalFilters((previousFilters) => ({
                ...previousFilters,
                WITH_ZEROS: event.target.checked ? ['true'] : [],
              }))
            }
          />
        </div>
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

export const TmzCategoriesFilters = ({
  filters,
  isOpen,
  onApply,
  onClick,
  onClose,
}: TmzCategoriesFiltersProps) => (
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
    {isOpen && <TmzCategoriesFiltersModal filters={filters} onApply={onApply} onClose={onClose} />}
  </>
);
