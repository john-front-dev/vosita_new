export const stockAssetStatusLabels: Record<number, string> = {
  1: 'Новый',
  2: 'В хранении',
  3: 'В эксплуатации',
  4: 'Смешанный',
  8: 'Списан',
  19: 'В ожидании принятия',
};

export const stockAssetFilterStatusLabels: Record<string, string> = {
  '1': 'Новые',
  '2': 'В хранении',
  '19': 'В ожидании принятия',
};

export const stockAssetStatusBadgeVariants: Record<
  number,
  'info' | 'neutral' | 'success' | 'warning' | 'error'
> = {
  1: 'info',
  2: 'neutral',
  3: 'success',
  4: 'warning',
  8: 'error',
  19: 'warning',
};

type StockAssetStatusColor = 'blue' | 'green' | 'grey' | 'red' | 'yellow';

export const getStockAssetStatusPresentation = (isRepair?: number, statusId?: number) => {
  if (isRepair === 1) {
    return { color: 'red' as const, label: 'В ремонте' };
  }

  const colorByStatus: Record<number, StockAssetStatusColor> = {
    1: 'blue',
    2: 'blue',
    3: 'green',
    4: 'green',
    8: 'grey',
    19: 'yellow',
  };

  return {
    color: statusId ? (colorByStatus[statusId] ?? 'blue') : 'blue',
    label: statusId ? (stockAssetStatusLabels[statusId] ?? 'В эксплуатации') : 'В эксплуатации',
  };
};
