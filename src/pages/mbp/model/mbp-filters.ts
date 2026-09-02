export type MbpFilterKey =
  | 'responsible_id'
  | 'department_id'
  | 'subdivision_id'
  | 'room_id'
  | 'storage_id'
  | 'status';

export type MbpFilters = Record<MbpFilterKey, string[]>;

export const mbpFilterKeys = [
  'responsible_id',
  'department_id',
  'subdivision_id',
  'room_id',
  'storage_id',
  'status',
] as const satisfies readonly MbpFilterKey[];

export const mbpDefaultFilters: MbpFilters = {
  responsible_id: [],
  department_id: [],
  subdivision_id: [],
  room_id: [],
  storage_id: [],
  status: [],
};
