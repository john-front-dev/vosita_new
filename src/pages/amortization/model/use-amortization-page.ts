import { useMemo, useState } from 'react';

import { useFileDownload } from '@shared/api';
import { useDebouncedValue } from '@shared/lib';

import { amortizationEndpoints } from '../api/amortization-api';
import { getAmortizationColumns } from './amortization-columns';
import {
  defaultAmortizationFilters,
  getDefaultAmortizationDate,
  toAmortizationQueryDate,
} from './amortization-utils';
import type { AmortizationFilters, AmortizationType } from './types';
import { useAmortizationList } from './use-amortization-list';

export const useAmortizationPage = (type: AmortizationType) => {
  const [from, setFrom] = useState(getDefaultAmortizationDate);
  const [to, setTo] = useState(getDefaultAmortizationDate);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<AmortizationFilters>(defaultAmortizationFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const debouncedSearchText = useDebouncedValue(searchText);
  const fromDate = toAmortizationQueryDate(from);
  const toDate = toAmortizationQueryDate(to);
  const list = useAmortizationList({
    filters,
    from: fromDate,
    searchText: debouncedSearchText,
    to: toDate,
    type,
  });
  const downloadParams = useMemo(
    () => ({
      ...filters,
      FROM: fromDate,
      SEARCH_TEXT: debouncedSearchText,
      TO: toDate,
    }),
    [debouncedSearchText, filters, fromDate, toDate],
  );
  const fileDownload = useFileDownload({
    filename: 'amortization-report.xlsx',
    params: downloadParams,
    url: amortizationEndpoints.download,
  });

  return {
    columns: getAmortizationColumns(type),
    fileDownload,
    filters,
    from,
    isFiltersOpen,
    isListLoading: list.isLoading || list.isFetching,
    records: list.records,
    searchText,
    setFilters,
    setFrom,
    setIsFiltersOpen,
    setSearchText,
    setTo,
    title: type === 'fixed-assets' ? 'Амортизация ОС' : 'Амортизация ПАУ',
    to,
  };
};
