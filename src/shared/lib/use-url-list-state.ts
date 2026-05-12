import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { paginationConfig } from '@shared/config';

import { useDebouncedValue } from './use-debounced-value';

type UseUrlListStateParams<TType extends string, TFilterKey extends string> = {
  debounceDelay?: number;
  defaultType?: TType;
  clearOnTypeChange?: boolean;
  filterKeys?: readonly TFilterKey[];
  isType?: (value: string | null) => value is TType;
  searchParamKey?: string;
  typeParamKey?: string;
};

type UrlListState<TType extends string, TFilterKey extends string> = {
  debouncedSearchText: string;
  limit: number;
  page: number;
  pagination: {
    currentPage: number;
    onPageChange: (nextPage: number) => void;
    onPageSizeChange: (nextLimit: number) => void;
    pageSize: number;
  };
  queryParams: {
    filters: Record<TFilterKey, string[]>;
    limit: number;
    page: number;
    searchText: string;
  };
  clearFilters: () => void;
  filters: Record<TFilterKey, string[]>;
  searchParams: URLSearchParams;
  searchText: string;
  setFilter: (key: TFilterKey, values: string[]) => void;
  setFilters: (filters: Record<TFilterKey, string[]>) => void;
  setLimit: (nextLimit: number) => void;
  setPage: (nextPage: number) => void;
  setSearchText: (value: string) => void;
  setType: (value: string) => void;
  type: TType | undefined;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsedValue = Number.parseInt(value ?? '', 10);

  return Number.isNaN(parsedValue) || parsedValue < 1 ? fallback : parsedValue;
};

const normalizePositiveInt = (value: number, fallback: number) =>
  Number.isNaN(value) || value < 1 ? fallback : value;

const parseArrayParam = (searchParams: URLSearchParams, key: string) =>
  searchParams
    .getAll(key)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

const getFilterValues = (searchParams: URLSearchParams, filterKeys: readonly string[]) =>
  filterKeys.reduce<Record<string, string[]>>((accumulator, key) => {
    accumulator[key] = parseArrayParam(searchParams, key);

    return accumulator;
  }, {});

const applyFilterValues = (searchParams: URLSearchParams, filters: Record<string, string[]>) => {
  Object.entries(filters).forEach(([key, values]) => {
    const normalizedValues = values
      .map(String)
      .map((value) => value.trim())
      .filter(Boolean);

    if (normalizedValues.length) {
      searchParams.set(key, normalizedValues.join(','));
    } else {
      searchParams.delete(key);
    }
  });
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
  debounceDelay,
  defaultType,
  filterKeys = [],
  isType,
  searchParamKey = 'search_text',
  typeParamKey = 'type',
  clearOnTypeChange = false,
}: UseUrlListStateParams<TType, TFilterKey> = {}): UrlListState<TType, TFilterKey> {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFromQuery = searchParams.get(typeParamKey);
  const type = isType?.(typeFromQuery) ? typeFromQuery : defaultType;
  const searchText = searchParams.get(searchParamKey) ?? '';
  const debouncedSearchText = useDebouncedValue(searchText, debounceDelay);
  const page = parsePositiveInt(searchParams.get('page'), paginationConfig.defaultPage);
  const limit = parsePositiveInt(searchParams.get('limit'), paginationConfig.defaultLimit);
  const filters = getFilterValues(searchParams, filterKeys) as Record<TFilterKey, string[]>;

  const updateSearchParams = useCallback(
    (next: { limit?: number; page?: number; searchText?: string; type?: TType }) => {
      setSearchParams(
        (prevParams) => {
          const nextParams = new URLSearchParams(prevParams);

          if (next.page !== undefined) {
            nextParams.set('page', String(next.page));
          }

          if (next.limit !== undefined) {
            nextParams.set('limit', String(next.limit));
          }

          if (next.type !== undefined) {
            nextParams.set(typeParamKey, next.type);
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
    [searchParamKey, setSearchParams, typeParamKey],
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
      searchParamKey,
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
          applyFilterValues(nextParams, nextFilters);

          return nextParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
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
    debouncedSearchText,
    filters,
    limit,
    page,
    pagination: {
      currentPage: page,
      onPageChange: setPage,
      onPageSizeChange: setLimit,
      pageSize: limit,
    },
    queryParams: {
      filters,
      limit,
      page,
      searchText: debouncedSearchText,
    },
    searchParams,
    searchText,
    setFilter,
    setFilters,
    setLimit,
    setPage,
    setSearchText,
    setType,
    type,
  };
}
