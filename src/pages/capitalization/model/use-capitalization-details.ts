import { useGetQuery } from '@shared/api';

import { capitalizationEndpoints } from '../api/capitalization-api';
import type { CapitalizationDetailsResponse } from './types';

export const useCapitalizationDetails = (capitalizationId: number | null) => {
  const query = useGetQuery<CapitalizationDetailsResponse>({
    queryKey: ['capitalization-details', capitalizationId],
    url: capitalizationEndpoints.details(capitalizationId ?? ''),
    options: { enabled: capitalizationId !== null },
  });

  return { ...query, capitalization: query.data?.payload };
};
