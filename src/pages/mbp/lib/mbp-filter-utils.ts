import { buildAppliedFilterTags } from '@shared/lib';

import type { MbpFilterKey, MbpFilters } from '../model/mbp-filters';
import type { MbpRecord } from '../model/types';

const getUniqueOptions = (
  records: MbpRecord[],
  getId: (record: MbpRecord) => number | string | undefined,
  getLabel: (record: MbpRecord) => string | undefined,
) => {
  const options = new Map<string, string>();

  records.forEach((record) => {
    const id = getId(record);
    const label = getLabel(record)?.trim();

    if (id !== undefined && id !== '' && label) {
      options.set(String(id), label);
    }
  });

  return Array.from(options, ([value, label]) => ({ label, value }));
};

export const getMbpResponsibleOptions = (records: MbpRecord[]) =>
  getUniqueOptions(
    records,
    (record) => record.responsible_id,
    (record) => record.responsible_name,
  );

export const getMbpDepartmentOptions = (records: MbpRecord[]) =>
  getUniqueOptions(
    records,
    (record) => record.department_id,
    (record) => record.department_name,
  );

export const getMbpSubdivisionOptions = (records: MbpRecord[], departmentId?: string) =>
  getUniqueOptions(
    records.filter(
      (record) => !departmentId || String(record.department_id ?? '') === departmentId,
    ),
    (record) => record.subdivision_id,
    (record) => record.subdivision_name,
  );

export const getMbpRoomOptions = (records: MbpRecord[], subdivisionId?: string) =>
  getUniqueOptions(
    records.filter(
      (record) => !subdivisionId || String(record.subdivision_id ?? '') === subdivisionId,
    ),
    (record) => record.rooms_id,
    (record) => record.rooms_name,
  );

export const getMbpStorageOptions = (records: MbpRecord[], subdivisionId?: string) =>
  getUniqueOptions(
    records.filter(
      (record) => !subdivisionId || String(record.subdivision_id ?? '') === subdivisionId,
    ),
    (record) => record.storage_id,
    (record) => record.storage_name,
  );

export const getMbpStatusOptions = (records: MbpRecord[]) =>
  getUniqueOptions(
    records,
    (record) => record.status,
    (record) => record.status_name,
  );

export const getAppliedMbpFilters = (filters: MbpFilters, records: MbpRecord[]) => {
  const departmentId = filters.department_id[0];
  const subdivisionId = filters.subdivision_id[0];

  return buildAppliedFilterTags<MbpFilterKey>([
    {
      key: 'responsible_id',
      options: getMbpResponsibleOptions(records),
      title: 'Пользователь',
      value: filters.responsible_id[0],
    },
    {
      key: 'department_id',
      options: getMbpDepartmentOptions(records),
      title: 'Город',
      value: departmentId,
    },
    {
      key: 'subdivision_id',
      options: getMbpSubdivisionOptions(records, departmentId),
      title: 'Здание',
      value: subdivisionId,
    },
    {
      key: 'room_id',
      options: getMbpRoomOptions(records, subdivisionId),
      title: 'Кабинет',
      value: filters.room_id[0],
    },
    {
      key: 'storage_id',
      options: getMbpStorageOptions(records, subdivisionId),
      title: 'Склад',
      value: filters.storage_id[0],
    },
    {
      key: 'status',
      options: getMbpStatusOptions(records),
      title: 'Статус',
      value: filters.status[0],
    },
  ]);
};
