import type { CategoryType } from './types';

export const categoryTabs: Array<{ label: string; value: CategoryType }> = [
  { label: 'ОС', value: 'os' },
  { label: 'ТМЗ', value: 'tmz' },
  { label: 'МБП', value: 'mbp' },
];

export const categoryAddLabels: Record<CategoryType, string> = {
  os: 'Добавить категорию',
  tmz: 'Добавить тип расхода',
  mbp: 'Добавить категорию МБП',
};

export const taxGroupOptions = [1, 2, 3, 4, 5].map((value) => ({
  label: String(value),
  value: String(value),
}));
