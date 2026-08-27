import { useMemo } from 'react';

import { useGetQuery } from '@shared/api';

import { tmzCategoriesEndpoints } from '../api/tmz-categories-api';
import type { TmzCategoriesFilters } from './tmz-categories-filters';
import type {
  TmzCategoriesResponse,
  TmzCategoryRow,
  TmzSearchResponse,
} from './types';

type UseTmzCategoriesParams = {
  filters: TmzCategoriesFilters;
  limit: number;
  page: number;
  searchText: string;
  storageId: number;
};

export const useTmzCategories = ({
  filters,
  limit,
  page,
  searchText,
  storageId,
}: UseTmzCategoriesParams) => {
  const normalizedSearch = searchText.trim();
  const listParams = useMemo(
    () => ({
      CAT_ID: filters.CATEGORY_ID[0] ?? '',
      LIMIT: limit,
      PAGE: page,
      SEARCH_TEXT: '',
      STORAGE_ID: storageId,
      SUB_ID: filters.BUILDING_ID[0] ?? '',
      WITH_ZEROS: filters.WITH_ZEROS[0] === 'true',
    }),
    [
      filters.BUILDING_ID,
      filters.CATEGORY_ID,
      filters.WITH_ZEROS,
      limit,
      page,
      storageId,
    ],
  );
  const listQuery = useGetQuery<TmzCategoriesResponse>({
    queryKey: ['tmz-categories'],
    url: tmzCategoriesEndpoints.list,
    params: listParams,
    options: { enabled: Boolean(storageId) },
  });
  const searchQuery = useGetQuery<TmzSearchResponse>({
    queryKey: ['tmz-categories-search'],
    url: tmzCategoriesEndpoints.search,
    params: { search: normalizedSearch, storage_id: storageId },
    options: { enabled: Boolean(storageId && normalizedSearch) },
  });
  const payload = listQuery.data?.payload;

  const listRows = useMemo<TmzCategoryRow[]>(
    () =>
      (payload?.tmz ?? []).map((category) => ({
        categoryId: category.id,
        displayId: category.id,
        id: `category-${category.id}`,
        kind: 'category',
        name: category.category ?? category.name ?? '-',
        storageId: category.storage_id ?? storageId,
        totalPrice: Number(category.total_price) || 0,
        totalQty: Number(category.total_qty) || 0,
      })),
    [payload?.tmz, storageId],
  );

  const searchRows = useMemo<TmzCategoryRow[]>(
    () =>
      (searchQuery.data?.payload ?? []).flatMap((category) => [
        {
          categoryId: category.category_id,
          displayId: category.category_id,
          id: `category-${category.category_id}`,
          kind: 'category' as const,
          name: category.category_name,
          storageId,
          totalPrice: category.objects.reduce(
            (sum, good) => sum + (Number(good.total_price) || 0),
            0,
          ),
          totalQty: category.objects.reduce(
            (sum, good) => sum + (Number(good.total_qty) || 0),
            0,
          ),
        },
        ...category.objects.map((good) => ({
          categoryId: category.category_id,
          displayId: good.goods_id,
          goodId: good.goods_id,
          id: `good-${category.category_id}-${good.goods_id}`,
          kind: 'good' as const,
          name: good.goods_name,
          price: Number(good.price) || 0,
          storageId,
          totalPrice: Number(good.total_price) || 0,
          totalQty: Number(good.total_qty) || 0,
          unit: good.unit,
        })),
      ]),
    [searchQuery.data?.payload, storageId],
  );

  return {
    isFetching: normalizedSearch ? searchQuery.isFetching : listQuery.isFetching,
    isLoading: normalizedSearch ? searchQuery.isLoading : listQuery.isLoading,
    isSearching: Boolean(normalizedSearch),
    rows: normalizedSearch ? searchRows : listRows,
    totalCount: payload?.total_count ?? (payload?.total_pages ?? 0) * limit,
    totalSum: Number(payload?.total_categories_sum) || 0,
  };
};
