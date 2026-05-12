type FormatDateOptions = {
  withTime?: boolean;
};

export const formatDate = (
  date?: Date | number | string | null,
  locale = 'ru',
  options: FormatDateOptions = {},
) => {
  if (!date) {
    return '-';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return options.withTime
    ? parsedDate.toLocaleString(locale)
    : parsedDate.toLocaleDateString(locale);
};
