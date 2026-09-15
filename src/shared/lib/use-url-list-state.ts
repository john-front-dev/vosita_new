import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { paginationConfig } from '@shared/config';

import {
  applyUrlFilterValues,
  getUrlFilterValues,
  normalizePositiveInt,
  parsePositiveInt,
} from './url-list-state-utils';
import { useDebouncedValue } from './use-debounced-value';

type UseUrlListStateParams<TType extends string, TFilterKey extends string> = {
  defaultType?: TType;
  clearOnTypeChange?: boolean;
  filterKeys?: readonly TFilterKey[];
  isType?: (value: string | null) => value is TType;
  typeParamKey?: string;
};

const searchParamKey = 'search_text';

type UrlListState<TType extends string, TFilterKey extends string> = {
  clearFilters: () => void;
  filters: Record<TFilterKey, string[]>;
  hasFilters: boolean;
  pagination: {
    currentPage: number;
    onPageChange: (nextPage: number) => void;
    onPageSizeChange: (nextLimit: number) => void;
    pageSize: number;
  };
  queryParams: {
    limit: number;
    page: number;
    searchText: string;
  };
  searchText: string;
  setFilter: (key: TFilterKey, values: string[]) => void;
  setFilters: (filters: Record<TFilterKey, string[]>) => void;
  setSearchText: (value: string) => void;
  setType: (value: string) => void;
  type: TType | undefined;
};

export function useUrlListState<TType extends string, TFilterKey extends string = string>(
  params: UseUrlListStateParams<TType, TFilterKey> & {
    defaultType: TType;
    isType: (value: string | null) => value is TType;
  },
): Omit<UrlListState<TType, TFilterKey>, 'type'> & { type: TType };

export function useUrlListState<TType extends string = string, TFilterKey extends string = string>(
  params?: UseUrlListStateParams<TType, TFilterKey>,
): UrlListState<TType, TFilterKey>;

export function useUrlListState<TType extends string = string, TFilterKey extends string = string>({
  defaultType,
  filterKeys = [],
  isType,
  typeParamKey = 'type',
  clearOnTypeChange = false,
}: UseUrlListStateParams<TType, TFilterKey> = {}): UrlListState<TType, TFilterKey> {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFromQuery = searchParams.get(typeParamKey);
  const type = isType?.(typeFromQuery) ? typeFromQuery : defaultType;
  const searchText = searchParams.get(searchParamKey) ?? '';
  const debouncedSearchText = useDebouncedValue(searchText);
  const page = parsePositiveInt(searchParams.get('page'), paginationConfig.defaultPage);
  const limit = parsePositiveInt(searchParams.get('limit'), paginationConfig.defaultLimit);
  const filters = getUrlFilterValues(searchParams, filterKeys) as Record<TFilterKey, string[]>;
  const hasFilters = filterKeys.some((key) => searchParams.has(key));

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let shouldReplace = false;

    if (searchParams.get('page') !== String(page)) {
      nextParams.set('page', String(page));
      shouldReplace = true;
    }

    if (searchParams.get('limit') !== String(limit)) {
      nextParams.set('limit', String(limit));
      shouldReplace = true;
    }

    if (type !== undefined && searchParams.get(typeParamKey) !== type) {
      nextParams.set(typeParamKey, type);
      shouldReplace = true;
    }

    if (!shouldReplace) {
      return;
    }

    setSearchParams(nextParams, { replace: true });
  }, [limit, page, searchParams, setSearchParams, type, typeParamKey]);

  const updateSearchParams = useCallback(
    (next: { limit?: number; page?: number; searchText?: string; type?: TType }) => {
      setSearchParams(
        (prevParams) => {
          const nextParams = new URLSearchParams(prevParams);
          nextParams.set('page', String(next.page ?? page));
          nextParams.set('limit', String(next.limit ?? limit));

          if (next.type !== undefined) {
            nextParams.set(typeParamKey, next.type);
          } else if (type !== undefined) {
            nextParams.set(typeParamKey, type);
          }

          if (next.searchText !== undefined) {
            if (next.searchText) {
              nextParams.set(searchParamKey, next.searchText);
            } else {
              nextParams.delete(searchParamKey);
            }
          }

          return nextParams;
        },
        { replace: true },
      );
    },
    [limit, page, setSearchParams, type, typeParamKey],
  );

  const setType = useCallback(
    (value: string) => {
      if (!isType?.(value)) {
        return;
      }

      if (!clearOnTypeChange) {
        updateSearchParams({ page: paginationConfig.defaultPage, type: value });
        return;
      }

      setSearchParams(
        (prevParams) => {
          const nextParams = new URLSearchParams(prevParams);

          nextParams.set('page', String(paginationConfig.defaultPage));
          nextParams.set('limit', String(limit));
          nextParams.set(typeParamKey, value);
          nextParams.delete(searchParamKey);

          filterKeys.forEach((filterKey) => {
            nextParams.delete(filterKey);
          });

          return nextParams;
        },
        { replace: true },
      );
    },
    [
      clearOnTypeChange,
      filterKeys,
      isType,
      limit,
      setSearchParams,
      typeParamKey,
      updateSearchParams,
    ],
  );

  const setSearchText = useCallback(
    (value: string) => {
      updateSearchParams({ page: paginationConfig.defaultPage, searchText: value });
    },
    [updateSearchParams],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      updateSearchParams({ page: nextPage });
    },
    [updateSearchParams],
  );

  const setLimit = useCallback(
    (nextLimit: number) => {
      updateSearchParams({
        limit: normalizePositiveInt(nextLimit, paginationConfig.defaultLimit),
        page: paginationConfig.defaultPage,
      });
    },
    [updateSearchParams],
  );

  const setFilters = useCallback(
    (nextFilters: Record<TFilterKey, string[]>) => {
      setSearchParams(
        (prevParams) => {
          const nextParams = new URLSearchParams(prevParams);

          nextParams.set('page', String(paginationConfig.defaultPage));
          nextParams.set('limit', String(limit));
          applyUrlFilterValues(nextParams, nextFilters);

          return nextParams;
        },
        { replace: true },
      );
    },
    [limit, setSearchParams],
  );

  const setFilter = useCallback(
    (key: TFilterKey, values: string[]) => {
      setFilters({ [key]: values } as Record<TFilterKey, string[]>);
    },
    [setFilters],
  );

  const clearFilters = useCallback(() => {
    setFilters(
      Object.fromEntries(filterKeys.map((key) => [key, []])) as unknown as Record<
        TFilterKey,
        string[]
      >,
    );
  }, [filterKeys, setFilters]);

  return {
    clearFilters,
    filters,
    hasFilters,
    pagination: {
      currentPage: page,
      onPageChange: setPage,
      onPageSizeChange: setLimit,
      pageSize: limit,
    },
    queryParams: {
      limit,
      page,
      searchText: debouncedSearchText,
    },
    searchText,
    setFilter,
    setFilters,
    setSearchText,
    setType,
    type,
  };
}
