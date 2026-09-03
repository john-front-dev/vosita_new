import { useGetQuery } from '@shared/api';

import { historyEndpoints } from '../api/history-api';
import type { HistoryDetails, HistoryDetailsResponse } from './types';

export const useHistoryDetails = (historyId: number | null) => {
  const query = useGetQuery<HistoryDetailsResponse>({
    queryKey: ['history-details', historyId],
    url: historyEndpoints.details(historyId ?? ''),
    options: { enabled: historyId !== null },
  });
  const payload = query.data?.payload;
  const history =
    payload && 'payload' in payload && Array.isArray(payload.payload)
      ? payload.payload[0]
      : (payload as HistoryDetails | undefined);

  return { ...query, history };
};
