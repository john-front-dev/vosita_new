import type { TrashType } from './types';

export const trashTabs: Array<{ label: string; value: TrashType }> = [
  { label: 'ОС', value: 'fixed-assets' },
  { label: 'ПАУ', value: 'lri' },
  { label: 'Другие', value: 'others' },
];

export const trashTypeLabels: Record<TrashType, string> = {
  'fixed-assets': 'ОС',
  lri: 'ПАУ',
  others: 'объект',
};
