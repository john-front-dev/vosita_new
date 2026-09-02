import { buildCleanQueryParams } from '@shared/lib';

import type { MbpFilters } from './mbp-filters';

export const buildMbpListParams = (
  filters: MbpFilters,
  page: number,
  limit: number,
  searchText?: string,
) =>
  buildCleanQueryParams({
    page,
    limit,
    search: searchText,
    responsible_id: filters.responsible_id[0],
    department_id: filters.department_id[0],
    subdivision_id: filters.subdivision_id[0],
    room_id: filters.room_id[0],
    storage_id: filters.storage_id[0],
    status: filters.status[0],
  });
