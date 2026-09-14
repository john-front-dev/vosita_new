export const isLowStock = (quantity: number, itemTypeName?: string) =>
  (itemTypeName === undefined || itemTypeName === 'ТМЗ') && quantity >= 1 && quantity <= 3;
