import { useGetQuery } from '@shared/api';

import { mbpEntityEndpoints } from '../api/mbp-api';
import type { MbpDetailsResponse } from './types';

export const useMbpDetails = (id?: string) => {
  const query = useGetQuery<MbpDetailsResponse>({
    queryKey: ['mbp-details', id],
    url: mbpEntityEndpoints.details(id ?? ''),
    options: { enabled: Boolean(id) },
  });

  return { ...query, mbp: query.data?.payload };
};
