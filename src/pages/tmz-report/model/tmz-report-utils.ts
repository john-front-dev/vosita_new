import type { GroupedDataTableColumn } from '@shared/ui';

import type { TmzReportEntry, TmzReportRecord } from './types';

const normalizeKey = (name: string) => name.replace(/\s+/g, '_').replace(/[().№]/g, '');

const getEntryName = (entry: TmzReportEntry, type: 'moved' | 'expensed') =>
  type === 'moved' ? entry.to_storage_name : entry.category_name;

export const getDynamicColumns = (
  records: TmzReportRecord[],
  type: 'moved' | 'expensed',
): GroupedDataTableColumn<TmzReportRecord>[] => {
  const names = new Map<string, string>();

  records.forEach((record) => {
    const entries = type === 'moved' ? record.moved_data : record.expensed_data;
    entries?.forEach((entry) => {
      const name = getEntryName(entry, type);
      if (name) names.set(name, normalizeKey(name));
    });
  });

  return [...names].map(([name, key]) => ({
    children: [
      {
        accessor: `${key}_qty`,
        id: `${key}-qty`,
        minWidth: 110,
        title: 'Кол-во',
      },
      {
        accessor: `${key}_sum`,
        id: `${key}-sum`,
        minWidth: 120,
        title: 'Сумма',
      },
    ],
    id: `${type}-${key}`,
    title: name,
  }));
};

export const transformTmzReportRecords = (records: TmzReportRecord[]) =>
  records.map((record) => {
    const dynamicValues: Record<string, number | undefined> = {};

    record.moved_data?.forEach((entry) => {
      if (!entry.to_storage_name) return;
      const key = normalizeKey(entry.to_storage_name);
      dynamicValues[`${key}_qty`] = entry.moved_qty;
      dynamicValues[`${key}_sum`] = entry.moved_sum;
    });
    record.expensed_data?.forEach((entry) => {
      if (!entry.category_name) return;
      const key = normalizeKey(entry.category_name);
      dynamicValues[`${key}_qty`] = entry.total_expenses;
      dynamicValues[`${key}_sum`] = entry.total_expense_sum;
    });

    return { ...record, ...dynamicValues };
  });

export const formatReportDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatHeaderDate = (date: string) => date.split('-').reverse().join('.');
