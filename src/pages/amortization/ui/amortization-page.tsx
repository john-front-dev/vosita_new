import { Button, DatePicker, OutlineSystemDownload, Search, Typography } from 'alif-ui';
import { Controller } from 'react-hook-form';

import { GroupedDataTable } from '@shared/ui';

import type { AmortizationType } from '../model/types';
import { useAmortizationPage } from '../model/use-amortization-page';
import { AmortizationFilters } from './amortization-filters';

type AmortizationPageProps = { type: AmortizationType };

export const AmortizationPage = ({ type }: AmortizationPageProps) => {
  const {
    columns,
    control,
    download,
    filters,
    isDownloading,
    isFiltersOpen,
    isListLoading,
    records,
    searchText,
    setIsFiltersOpen,
    setValue,
    title,
  } = useAmortizationPage(type);

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          {title}
        </Typography>
        <div className="flex shrink-0 items-end gap-3">
          <Controller
            control={control}
            name="from"
            render={({ field }) => (
              <DatePicker
                label="От"
                values={field.value}
                onDateChange={(date) => date instanceof Date && field.onChange(date)}
                allowTime={false}
                fullWidth
                className="min-w-44"
              />
            )}
          />
          <Controller
            control={control}
            name="to"
            render={({ field }) => (
              <DatePicker
                label="До"
                values={field.value}
                onDateChange={(date) => date instanceof Date && field.onChange(date)}
                allowTime={false}
                fullWidth
                className="min-w-44"
              />
            )}
          />
          {type === 'fixed-assets' && (
            <Button
              type="button"
              variant="outline-neutral"
              leftSection={<OutlineSystemDownload />}
              onClick={download}
              isLoading={isDownloading}
            >
              Скачать
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex min-w-0 gap-3">
          <Controller
            control={control}
            name="searchText"
            render={({ field }) => (
              <Search
                className="min-w-70 flex-1"
                label="Поиск"
                value={field.value}
                onChange={field.onChange}
                onClear={() => field.onChange('')}
                fullWidth
                proportions="l"
              />
            )}
          />
          <AmortizationFilters
            filters={filters}
            isOpen={isFiltersOpen}
            onApply={(nextFilters) => setValue('filters', nextFilters)}
            onClick={() => setIsFiltersOpen(true)}
            onClose={() => setIsFiltersOpen(false)}
          />
        </div>
        <GroupedDataTable
          columns={columns}
          records={records}
          isLoading={isListLoading}
          skeletonRowsCount={20}
          emptyPlaceholder={
            searchText
              ? `По поиску «${searchText}» ничего не найдено.`
              : 'Список амортизации пока пуст.'
          }
        />
      </div>
    </section>
  );
};
