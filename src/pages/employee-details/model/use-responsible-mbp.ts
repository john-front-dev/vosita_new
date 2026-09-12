import type { MbpListResponse } from '@entities/mbp';
import { useGetQuery } from '@shared/api';

import { employeeDetailsEndpoints } from '../api/employee-details-api';

export const useResponsibleMbp = (employeeId?: number | string, page = 1, enabled = true) => {
  const query = useGetQuery<MbpListResponse>({
    queryKey: ['employee-responsible-mbp', String(employeeId), page],
    url: employeeDetailsEndpoints.responsibleMbp,
    params: { limit: 10, page, responsible_id: employeeId },
    options: { enabled: enabled && employeeId !== undefined },
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.items ?? payload?.data ?? [],
    totalCount: payload?.total_count ?? payload?.total ?? (payload?.total_pages ?? 0) * 10,
  };
};
