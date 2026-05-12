import { buildCleanQueryParams } from '@shared/lib';

import type { ApplicationListParams } from '../model/types';

type RawApplicationListParams = {
  departmentIds?: string[];
  limit: number;
  page: number;
  searchText?: string;
  storageIds?: string[];
  subdivisionIds?: string[];
};

export const buildApplicationListParams = ({
  departmentIds,
  limit,
  page,
  searchText,
  storageIds,
  subdivisionIds,
}: RawApplicationListParams): ApplicationListParams =>
  buildCleanQueryParams(
    {
      DEPARTMENT_ID: departmentIds,
      LIMIT: limit,
      PAGE: page,
      SEARCH_TEXT: searchText,
      STORAGE_ID: storageIds,
      SUBDIVISION_ID: subdivisionIds,
    },
    { uppercaseKeys: true },
  ) as ApplicationListParams;
