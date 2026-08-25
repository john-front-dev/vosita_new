import { useState } from 'react';
import {
  Button,
  DatePicker,
  OutlineSystemDownload,
  OutlineSystemFilterFromLessToMore,
  Search,
  Surface,
  Typography,
} from 'alif-ui';

import { useFileDownload } from '@shared/api';
import { useDebouncedValue } from '@shared/lib';
import { GroupedDataTable, type GroupedDataTableColumn } from '@shared/ui';

import { amortizationEndpoints } from '../api/amortization-api';
import {
  defaultAmortizationFilters,
  getDefaultAmortizationDate,
  renderAmortizationDate,
  renderAmortizationMoney,
  toAmortizationQueryDate,
} from '../model/amortization-utils';
import type { AmortizationFilters, AmortizationRecord } from '../model/types';
import { useAmortizationList } from '../model/use-amortization-list';
import { AmortizationFiltersModal } from './amortization-filters-modal';

type AmortizationPageProps = { type: 'fixed-assets' | 'lri' };

const fixedAssetsColumns: GroupedDataTableColumn<AmortizationRecord>[] = [
  { accessor: 'category', id: 'category', minWidth: 170, width: 170, title: 'Основное средство' },
  {
    id: 'amortization-date',
    minWidth: 145,
    renderCell: (record) => renderAmortizationDate(record, 'amortization_date'),
    title: 'Дата принятия к учету',
  },
  {
    accessor: 'inventory_number',
    id: 'inventory-number',
    minWidth: 150,
    title: 'Инвентарный номер',
  },
  {
    accessor: 'amortization_norm',
    id: 'amortization-norm',
    minWidth: 130,
    title: 'Годовая амортизация, %',
  },
  {
    id: 'price',
    minWidth: 150,
    renderCell: (record) => renderAmortizationMoney(record, 'price'),
    title: 'Первоначальная стоимость',
  },
  {
    id: 'start-period',
    title: 'На начало периода',
    children: [
      {
        id: 'start-balance',
        minWidth: 150,
        renderCell: (record) => renderAmortizationMoney(record, 'start_balance'),
        title: 'Стоимость',
      },
      {
        id: 'start-amortization',
        minWidth: 150,
        renderCell: (record) => renderAmortizationMoney(record, 'start_amortization'),
        title: 'Амортизация',
      },
      {
        id: 'start-stock',
        minWidth: 160,
        renderCell: (record) => renderAmortizationMoney(record, 'start_stock'),
        title: 'Остаточная стоимость',
      },
    ],
  },
  {
    id: 'period',
    title: 'За период',
    children: [
      {
        id: 'post-up-balance',
        minWidth: 150,
        renderCell: (record) => renderAmortizationMoney(record, 'post_up_balance'),
        title: 'Увеличение стоимости',
      },
      {
        id: 'amortization-debit',
        minWidth: 150,
        renderCell: (record) => renderAmortizationMoney(record, 'amortization_debit'),
        title: 'Амортизация: начисление',
      },
      {
        id: 'amortization-credit',
        minWidth: 150,
        renderCell: (record) => renderAmortizationMoney(record, 'amortization_credit'),
        title: 'Амортизация: списание',
      },
      {
        id: 'post-down-balance',
        minWidth: 150,
        renderCell: (record) => renderAmortizationMoney(record, 'post_down_balance'),
        title: 'Уменьшение стоимости',
      },
    ],
  },
  {
    id: 'end-period',
    title: 'На конец периода',
    children: [
      {
        id: 'end-balance',
        minWidth: 150,
        renderCell: (record) => renderAmortizationMoney(record, 'end_balance'),
        title: 'Стоимость',
      },
      {
        id: 'end-amortization',
        minWidth: 150,
        renderCell: (record) => renderAmortizationMoney(record, 'end_amortization'),
        title: 'Амортизация',
      },
      {
        id: 'end-stock',
        minWidth: 160,
        renderCell: (record) => renderAmortizationMoney(record, 'end_stock'),
        title: 'Остаточная стоимость',
      },
    ],
  },
  { accessor: 'city', id: 'city', minWidth: 130, title: 'Город' },
  { accessor: 'subdivision', id: 'subdivision', minWidth: 160, title: 'Здание' },
  { accessor: 'room', id: 'room', minWidth: 120, title: 'Кабинет' },
  { accessor: 'responsible', id: 'responsible', minWidth: 180, title: 'Ответственное лицо' },
  { accessor: 'object_name', id: 'object-name', minWidth: 200, title: 'Название' },
  { accessor: 'currency', id: 'currency', minWidth: 95, title: 'Валюта' },
  {
    id: 'purchase-date',
    minWidth: 135,
    renderCell: (record) => renderAmortizationDate(record, 'purchase_date'),
    title: 'Дата покупки',
  },
  { accessor: 'status', id: 'status', minWidth: 130, title: 'Статус' },
];

const lriColumns: GroupedDataTableColumn<AmortizationRecord>[] = [
  { accessor: 'name', id: 'name', minWidth: 200, title: 'ПАУ' },
  {
    id: 'amortization-date',
    minWidth: 145,
    renderCell: (record) => renderAmortizationDate(record, 'amortization_date'),
    title: 'Дата принятия к учету',
  },
  {
    id: 'purchase-date',
    minWidth: 135,
    renderCell: (record) => renderAmortizationDate(record, 'purchase_date'),
    title: 'Дата покупки',
  },
  {
    id: 'start-date',
    minWidth: 135,
    renderCell: (record) => renderAmortizationDate(record, 'start_date'),
    title: 'Начало контракта',
  },
  {
    id: 'end-date',
    minWidth: 135,
    renderCell: (record) => renderAmortizationDate(record, 'end_date'),
    title: 'Конец контракта',
  },
  {
    id: 'price',
    minWidth: 150,
    renderCell: (record) => renderAmortizationMoney(record, 'price'),
    title: 'Первоначальная стоимость',
  },
  { accessor: 'city', id: 'city', minWidth: 130, title: 'Город' },
  { accessor: 'subdivision', id: 'subdivision', minWidth: 160, title: 'Здание' },
  { accessor: 'responsible', id: 'responsible', minWidth: 180, title: 'Ответственное лицо' },
  { accessor: 'status', id: 'status', minWidth: 130, title: 'Статус' },
];

export const AmortizationPage = ({ type }: AmortizationPageProps) => {
  const [from, setFrom] = useState(getDefaultAmortizationDate);
  const [to, setTo] = useState(getDefaultAmortizationDate);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<AmortizationFilters>(defaultAmortizationFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const debouncedSearchText = useDebouncedValue(searchText);
  const list = useAmortizationList({
    filters,
    from: toAmortizationQueryDate(from),
    searchText: debouncedSearchText,
    to: toAmortizationQueryDate(to),
    type,
  });
  const columns = type === 'fixed-assets' ? fixedAssetsColumns : lriColumns;

  const fileDownload = useFileDownload({
    filename: 'amortization-report.xlsx',
    params: {
      ...filters,
        FROM: toAmortizationQueryDate(from),
      SEARCH_TEXT: debouncedSearchText,
        TO: toAmortizationQueryDate(to),
    },
    url: amortizationEndpoints.download,
  });

  const title = type === 'fixed-assets' ? 'Амортизация ОС' : 'Амортизация ПАУ';

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
      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
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
          records={list.records}
          isLoading={list.isLoading || list.isFetching}
          skeletonRowsCount={20}
          emptyPlaceholder={
            searchText
              ? `По поиску «${searchText}» ничего не найдено.`
              : 'Список амортизации пока пуст.'
          }
        />
      </Surface>
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
