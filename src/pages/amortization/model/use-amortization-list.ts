import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { amortizationEndpoints } from '../api/amortization-api';
import type { AmortizationRecord, AmortizationResponse, UseAmortizationListParams } from './types';

const amortizationListEndpoints = {
  'fixed-assets': amortizationEndpoints.fixedAssets,
  lri: amortizationEndpoints.lri,
} as const;

export const useAmortizationList = ({
  filters,
  from,
  searchText,
  to,
  type,
}: UseAmortizationListParams) => {
  const params = useMemo(
    () => ({
      ...filters,
      FROM: from,
      SEARCH_TEXT: searchText,
      TO: to,
    }),
    [filters, from, searchText, to],
  );
  const query = useGetQuery<AmortizationResponse>({
    queryKey: ['amortization', type],
    params,
    url: amortizationListEndpoints[type],
  });
  const payload = query.data?.payload;
  const records: AmortizationRecord[] = Array.isArray(payload) ? payload : (payload?.data ?? []);

  return { ...query, records };
};
