import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { tmzReportEndpoints } from '../api/tmz-report-api';
import type { TmzReportParams, TmzReportResponse } from './types';

export const useTmzReport = (params: TmzReportParams) => {
  const queryParams = useMemo(() => params, [params]);
  const query = useGetQuery<TmzReportResponse>({
    options: { enabled: Boolean(params.storage_id) },
    params: queryParams,
    queryKey: ['tmz-report'],
    url: tmzReportEndpoints.list,
  });

  return { ...query, records: query.data?.payload ?? [] };
};
