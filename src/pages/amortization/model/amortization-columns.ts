import type { GroupedDataTableColumn } from '@shared/ui';

import { renderAmortizationDate, renderAmortizationMoney } from './amortization-utils';
import type { AmortizationRecord, AmortizationType } from './types';

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

export const getAmortizationColumns = (type: AmortizationType) =>
  type === 'fixed-assets' ? fixedAssetsColumns : lriColumns;
