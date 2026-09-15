import { useMemo, useState } from 'react';
import {
  Button,
  OutlineSystemAdd,
  OutlineSystemEdit,
  OutlineSystemTrash,
  Search,
  SegmentedControl,
  Surface,
  Typography,
} from 'alif-ui';

import { getStoredUser, useUrlListState } from '@shared/lib';
import { ConfirmModal, DataTable, type DataTableProps } from '@shared/ui';

import { locationTabs, locationTypeLabels } from '../model/location-tabs';
import type {
  BuildingRecord,
  CabinetRecord,
  CityRecord,
  LocationRecord,
  LocationType,
} from '../model/types';
import { isLocationType } from '../model/types';
import { useRemoveLocation } from '../model/use-location-mutations';
import { useLocationsList } from '../model/use-locations-list';
import { LocationFormModal } from './location-form-modal';

type RemovingLocation = { id: number; name: string };

const getRecordName = (type: LocationType, record: LocationRecord) =>
  type === 'cabinets' ? (record as CabinetRecord).room : (record as CityRecord).name;

const getRemoveMessage = (type: LocationType) => {
  if (type === 'cities') return 'После удаления города будут удалены все его здания и кабинеты.';
  if (type === 'buildings') return 'После удаления здания будут удалены все его кабинеты.';
  return 'После удаления запись нельзя будет восстановить.';
};

export const LocationsPage = () => {
  const canManage = getStoredUser()?.access === 'редактор';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LocationRecord | null>(null);
  const [removing, setRemoving] = useState<RemovingLocation | null>(null);
  const { pagination, queryParams, searchText, setSearchText, setType, type } = useUrlListState({
    clearOnTypeChange: true,
    defaultType: 'cities',
    isType: isLocationType,
  });
  const { isFetching, isLoading, records, totalCount } = useLocationsList({
    limit: queryParams.limit,
    page: queryParams.page,
    searchText: queryParams.searchText,
    type,
  });
  const { isRemoving, remove } = useRemoveLocation(type, () => setRemoving(null));
  const columns = useMemo<DataTableProps<LocationRecord>['columns']>(() => {
    const commonColumns: DataTableProps<LocationRecord>['columns'] = [
      { accessor: 'id', minWidth: '100px', title: 'ID' },
    ];
    const typeColumns: DataTableProps<LocationRecord>['columns'] =
      type === 'cities'
        ? [{ accessor: 'name', minWidth: '300px', title: 'Город' }]
        : type === 'buildings'
          ? [
              { accessor: 'name', minWidth: '220px', title: 'Здание' },
              { accessor: 'city', minWidth: '220px', title: 'Город' },
              {
                accessor: 'crm_id',
                minWidth: '150px',
                renderRowCell: (record) => (record as BuildingRecord).crm_id || '-',
                title: 'CRM ID',
              },
            ]
          : type === 'cabinets'
            ? [
                { accessor: 'room', minWidth: '200px', title: 'Кабинет' },
                { accessor: 'building', minWidth: '220px', title: 'Здание' },
                { accessor: 'city', minWidth: '220px', title: 'Город' },
              ]
            : [
                { accessor: 'name', minWidth: '220px', title: 'Склад' },
                { accessor: 'subdivision_name', minWidth: '220px', title: 'Здание' },
                { accessor: 'department_name', minWidth: '220px', title: 'Город' },
              ];

    if (!canManage) return [...commonColumns, ...typeColumns];
    return [
      ...commonColumns,
      ...typeColumns,
      {
        accessor: 'actions',
        minWidth: type === 'warehouses' ? '72px' : '112px',
        renderRowCell: (record) => (
          <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
            <Button
              type="button"
              variant="tertiary"
              size="s"
              isIconBtn
              aria-label="Изменить"
              onClick={() => {
                setEditingRecord(record);
                setIsFormOpen(true);
              }}
            >
              <OutlineSystemEdit />
            </Button>
            {type !== 'warehouses' && (
              <Button
                type="button"
                variant="tertiary"
                size="s"
                isIconBtn
                aria-label="Удалить"
                onClick={() => setRemoving({ id: record.id, name: getRecordName(type, record) })}
              >
                <OutlineSystemTrash />
              </Button>
            )}
          </div>
        ),
        textAlign: 'end',
        title: '',
      },
    ];
  }, [canManage, type]);

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          Местоположения
        </Typography>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            tabs={locationTabs}
            value={type}
            onChange={setType}
            rounded
            size="m"
            variant="accent"
          />
          {canManage && (
            <Button
              type="button"
              variant="primary"
              leftSection={<OutlineSystemAdd />}
              onClick={() => {
                setEditingRecord(null);
                setIsFormOpen(true);
              }}
            >
              {locationTypeLabels[type].add}
            </Button>
          )}
        </div>
      </div>
      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <Search
          className="min-w-70"
          label="Поиск"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onClear={() => setSearchText('')}
          fullWidth
          proportions="l"
        />
        <DataTable
          columns={columns}
          records={records}
          isFetching={isFetching}
          isLoading={isLoading}
          emptyPlaceholder={
            queryParams.searchText
              ? `По поиску «${queryParams.searchText}» ничего не найдено.`
              : 'Список местоположений пока пуст.'
          }
          pagination={{ ...pagination, totalCount }}
        />
      </Surface>
      {isFormOpen && (
        <LocationFormModal
          isOpen
          type={type}
          record={editingRecord}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecord(null);
          }}
        />
      )}
      <ConfirmModal
        isOpen={removing !== null}
        title={`Удалить ${locationTypeLabels[type].singular} «${removing?.name ?? ''}»?`}
        message={getRemoveMessage(type)}
        confirmText="Удалить"
        variant="risk"
        isConfirmLoading={isRemoving}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove(removing.id)}
      />
    </section>
  );
};
