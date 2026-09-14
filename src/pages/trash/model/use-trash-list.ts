import { useGetQuery } from '@shared/api';

import { trashEndpoints } from '../api/trash-api';
import type { TrashListResponse, TrashType } from './types';

type Params = {
  limit: number;
  page: number;
  searchText: string;
  type: TrashType;
};

export const useTrashList = ({ limit, page, searchText, type }: Params) => {
  const url =
    type === 'fixed-assets'
      ? trashEndpoints.fixedAssets
      : type === 'lri'
        ? trashEndpoints.lri
        : trashEndpoints.others;
  const query = useGetQuery<TrashListResponse>({
    queryKey: ['trash-list', type],
    url,
    params: {
      LIMIT: limit,
      PAGE: page,
      SEARCH_TEXT: searchText,
    },
  });
  const payload = query.data?.payload;

  return {
    ...query,
    records: payload?.data ?? [],
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
  };
};
