import { formatDate, formatMoney } from '@shared/lib';

import type { AmortizationRecord } from './types';
import type { AmortizationFilters } from './types';

export const getDefaultAmortizationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
};

export const toAmortizationQueryDate = (date: Date) => date.toISOString().slice(0, 10);

export const defaultAmortizationFilters: AmortizationFilters = {
  BUILDING_ID: '',
  CATEGORY_ID: '',
  CITY_ID: '',
  RESPONSIBLE_PERSON_ID: '',
  ROOM_ID: '',
  STATUS_ID: '',
};

export const renderAmortizationMoney = (record: AmortizationRecord, key: string) => {
  const value = record[key];

  return value === undefined || value === null || value === ''
    ? '-'
    : formatMoney(Number(value), { currency: record.currency });
};

export const renderAmortizationDate = (record: AmortizationRecord, key: string) =>
  formatDate(record[key] as string);
