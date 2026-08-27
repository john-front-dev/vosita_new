import {
  Button,
  DatePicker,
  OutlineSystemDownload,
  OutlineSystemFilterFromLessToMore,
  Search,
  Typography,
} from 'alif-ui';

import { GroupedDataTable } from '@shared/ui';

import type { AmortizationType } from '../model/types';
import { useAmortizationPage } from '../model/use-amortization-page';
import { AmortizationFiltersModal } from './amortization-filters-modal';

type AmortizationPageProps = { type: AmortizationType };

export const AmortizationPage = ({ type }: AmortizationPageProps) => {
  const {
    columns,
    fileDownload,
    filters,
    from,
    isFiltersOpen,
    isListLoading,
    records,
    searchText,
    setFilters,
    setFrom,
    setIsFiltersOpen,
    setSearchText,
    setTo,
    title,
    to,
  } = useAmortizationPage(type);

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          {title}
        </Typography>
        <div className="flex shrink-0 items-end gap-3">
          <DatePicker
            label="От"
            values={from}
            onDateChange={(date) => {
              if (date instanceof Date) {
                setFrom(date);
              }
            }}
            allowTime={false}
            fullWidth
            className="min-w-44"
          />
          <DatePicker
            label="До"
            values={to}
            onDateChange={(date) => {
              if (date instanceof Date) {
                setTo(date);
              }
            }}
            allowTime={false}
            fullWidth
            className="min-w-44"
          />
          {type === 'fixed-assets' && (
            <Button
              type="button"
              variant="outline-neutral"
              leftSection={<OutlineSystemDownload />}
              onClick={fileDownload.download}
              isLoading={fileDownload.isDownloading}
            >
              Скачать
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex min-w-0 gap-3">
          <Search
            className="min-w-70 flex-1"
            label="Поиск"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
            onClear={() => {
              setSearchText('');
            }}
            fullWidth
            proportions="l"
          />
          <Button
            type="button"
            variant="outline-neutral"
            size="l"
            leftSection={<OutlineSystemFilterFromLessToMore />}
            onClick={() => setIsFiltersOpen(true)}
          >
            Фильтр
          </Button>
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
      {isFiltersOpen && (
        <AmortizationFiltersModal
          filters={filters}
          isOpen
          onApply={setFilters}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}
    </section>
  );
};
