type FormatMoneyOptions = {
  currency?: string;
  locale?: string;
};

export const formatMoney = (
  value?: number | null,
  { currency, locale = 'ru' }: FormatMoneyOptions = {},
) => {
  if (value === undefined || value === null) {
    return '-';
  }

  return `${Number(value).toLocaleString(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}${currency ? ` ${currency}` : ''}`;
};
