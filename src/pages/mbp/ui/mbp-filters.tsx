import { useMemo, useState } from 'react';
import { Button, Modal, OutlineSystemFilterFromLessToMore, Select } from 'alif-ui';

import { normalizeSelectValue } from '@shared/lib';

import {
  getMbpDepartmentOptions,
  getMbpResponsibleOptions,
  getMbpRoomOptions,
  getMbpStatusOptions,
  getMbpStorageOptions,
  getMbpSubdivisionOptions,
} from '../lib/mbp-filter-utils';
import type { MbpFilters as MbpFiltersValues } from '../model/mbp-filters';
import type { MbpRecord } from '../model/types';

type MbpFiltersProps = {
  filters: MbpFiltersValues;
  isLoading: boolean;
  isOpen: boolean;
  onApply: (filters: MbpFiltersValues) => void;
  onClick: () => void;
  onClose: () => void;
  records: MbpRecord[];
};

type MbpFiltersModalProps = Pick<
  MbpFiltersProps,
  'filters' | 'isLoading' | 'onApply' | 'onClose' | 'records'
>;

const MbpFiltersModal = ({
  filters,
  isLoading,
  onApply,
  onClose,
  records,
}: MbpFiltersModalProps) => {
  const [localFilters, setLocalFilters] = useState<MbpFiltersValues>(filters);
  const departmentId = localFilters.department_id[0];
  const subdivisionId = localFilters.subdivision_id[0];
  const responsibleOptions = useMemo(() => getMbpResponsibleOptions(records), [records]);
  const departmentOptions = useMemo(() => getMbpDepartmentOptions(records), [records]);
  const subdivisionOptions = useMemo(
    () => getMbpSubdivisionOptions(records, departmentId),
    [departmentId, records],
  );
  const roomOptions = useMemo(
    () => getMbpRoomOptions(records, subdivisionId),
    [records, subdivisionId],
  );
  const storageOptions = useMemo(
    () => getMbpStorageOptions(records, subdivisionId),
    [records, subdivisionId],
  );
  const statusOptions = useMemo(() => getMbpStatusOptions(records), [records]);

  return (
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
          label="Пользователь"
          value={localFilters.responsible_id[0] || null}
          options={responsibleOptions}
          onChange={(value) => {
            const responsibleId = normalizeSelectValue(value);
            setLocalFilters((previous) => ({
              ...previous,
              responsible_id: responsibleId ? [responsibleId] : [],
            }));
          }}
          fullWidth
          isLoading={isLoading}
          proportions="m"
        />
        <Select
          label="Город"
          value={departmentId || null}
          options={departmentOptions}
          onChange={(value) => {
            const nextDepartmentId = normalizeSelectValue(value);
            setLocalFilters((previous) => ({
              ...previous,
              department_id: nextDepartmentId ? [nextDepartmentId] : [],
              room_id: [],
              storage_id: [],
              subdivision_id: [],
            }));
          }}
          fullWidth
          isLoading={isLoading}
          proportions="m"
        />
        <Select
          label="Здание"
          value={subdivisionId || null}
          options={subdivisionOptions}
          onChange={(value) => {
            const nextSubdivisionId = normalizeSelectValue(value);
            setLocalFilters((previous) => ({
              ...previous,
              room_id: [],
              storage_id: [],
              subdivision_id: nextSubdivisionId ? [nextSubdivisionId] : [],
            }));
          }}
          fullWidth
          disabled={!departmentId}
          isLoading={isLoading}
          proportions="m"
        />
        <Select
          label="Кабинет"
          value={localFilters.room_id[0] || null}
          options={roomOptions}
          onChange={(value) => {
            const roomId = normalizeSelectValue(value);
            setLocalFilters((previous) => ({
              ...previous,
              room_id: roomId ? [roomId] : [],
            }));
          }}
          fullWidth
          disabled={!subdivisionId}
          isLoading={isLoading}
          proportions="m"
        />
        <Select
          label="Склад"
          value={localFilters.storage_id[0] || null}
          options={storageOptions}
          onChange={(value) => {
            const storageId = normalizeSelectValue(value);
            setLocalFilters((previous) => ({
              ...previous,
              storage_id: storageId ? [storageId] : [],
            }));
          }}
          fullWidth
          disabled={!subdivisionId}
          isLoading={isLoading}
          proportions="m"
        />
        <Select
          label="Статус"
          value={localFilters.status[0] || null}
          options={statusOptions}
          onChange={(value) => {
            const status = normalizeSelectValue(value);
            setLocalFilters((previous) => ({
              ...previous,
              status: status ? [status] : [],
            }));
          }}
          fullWidth
          isLoading={isLoading}
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

export const MbpFilters = ({
  filters,
  isLoading,
  isOpen,
  onApply,
  onClick,
  onClose,
  records,
}: MbpFiltersProps) => (
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
    {isOpen && (
      <MbpFiltersModal
        filters={filters}
        isLoading={isLoading}
        onApply={onApply}
        onClose={onClose}
        records={records}
      />
    )}
  </>
);
