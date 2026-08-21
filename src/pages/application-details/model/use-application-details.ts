import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';
import { buildCleanQueryParams } from '@shared/lib';

import { applicationEndpoints } from '../api/applications-api';
import { getApplicationDetailsApiStatus } from './application-details-tabs';
import type {
  ApplicationDetailsParams,
  ApplicationDetailsResponse,
  ApplicationDetailsStatus,
} from './types';

type UseApplicationDetailsParams = {
  id?: string;
  limit: number;
  page: number;
  status: ApplicationDetailsStatus;
};

export const useApplicationDetails = ({ id, limit, page, status }: UseApplicationDetailsParams) => {
  const queryParams = useMemo(
    () =>
      buildCleanQueryParams({
        limit,
        page,
        status: getApplicationDetailsApiStatus(status),
      }) as ApplicationDetailsParams,
    [limit, page, status],
  );

  const query = useGetQuery<ApplicationDetailsResponse>({
    queryKey: ['application-details', id, status],
    url: applicationEndpoints.details(id ?? ''),
    params: queryParams,
    options: {
      enabled: Boolean(id),
    },
  });

  const details = query.data?.payload;
  const records = details?.objects ?? [];
  const totalPages = details?.total_pages ?? 0;
  const totalCount = details?.count?.total_count ?? totalPages * limit;

  return {
    ...query,
    details,
    records,
    totalCount,
    totalPages,
  };
};
