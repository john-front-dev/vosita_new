import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useFileDownload } from '@shared/api';
import { formatDateOnly, useDebouncedValue } from '@shared/lib';

import { amortizationEndpoints } from '../api/amortization-api';
import { getAmortizationColumns } from './amortization-columns';
import {
  defaultAmortizationFilters,
  getDefaultAmortizationDate,
} from './amortization-utils';
import type { AmortizationFormValues, AmortizationType } from './types';
import { useAmortizationList } from './use-amortization-list';

export const useAmortizationPage = (type: AmortizationType) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { control, setValue } = useForm<AmortizationFormValues>({
    defaultValues: {
      filters: defaultAmortizationFilters,
      from: getDefaultAmortizationDate(),
      searchText: '',
      to: getDefaultAmortizationDate(),
    },
  });
  const [filters, from, searchText, to] = useWatch({
    control,
    name: ['filters', 'from', 'searchText', 'to'],
  });
  const debouncedSearchText = useDebouncedValue(searchText);
  const fromDate = formatDateOnly(from);
  const toDate = formatDateOnly(to);
  const { isFetching, isLoading, records } = useAmortizationList({
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
  const { download, isDownloading } = useFileDownload({
    filename: 'amortization-report.xlsx',
    params: downloadParams,
    url: amortizationEndpoints.download,
  });

  return {
    columns: getAmortizationColumns(type),
    control,
    download,
    filters,
    isFiltersOpen,
    isDownloading,
    isListLoading: isLoading || isFetching,
    records,
    searchText,
    setIsFiltersOpen,
    setValue,
    title: type === 'fixed-assets' ? 'Амортизация ОС' : 'Амортизация ПАУ',
  };
};
