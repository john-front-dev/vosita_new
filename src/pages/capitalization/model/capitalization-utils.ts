import type { CapitalizationRecord } from './types';

export const formatCapitalizationDate = (
  record: Pick<CapitalizationRecord, 'capitalization_month' | 'capitalization_year'>,
) => {
  const month = Number(record.capitalization_month);
  const year = Number(record.capitalization_year);

  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 1) {
    return '-';
  }

  return `01-${String(month).padStart(2, '0')}-${year}`;
};
