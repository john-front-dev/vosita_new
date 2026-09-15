export const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsedValue = Number.parseInt(value ?? '', 10);

  return Number.isNaN(parsedValue) || parsedValue < 1 ? fallback : parsedValue;
};

export const normalizePositiveInt = (value: number, fallback: number) =>
  Number.isNaN(value) || value < 1 ? fallback : value;

const parseArrayParam = (searchParams: URLSearchParams, key: string) =>
  searchParams
    .getAll(key)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

export const getUrlFilterValues = (
  searchParams: URLSearchParams,
  filterKeys: readonly string[],
) =>
  filterKeys.reduce<Record<string, string[]>>((filters, key) => {
    filters[key] = parseArrayParam(searchParams, key);

    return filters;
  }, {});

export const applyUrlFilterValues = (
  searchParams: URLSearchParams,
  filters: Record<string, string[]>,
) => {
  Object.entries(filters).forEach(([key, values]) => {
    const normalizedValues = values
      .map(String)
      .map((value) => value.trim())
      .filter(Boolean);

    if (normalizedValues.length) {
      searchParams.set(key, normalizedValues.join(','));
    } else {
      searchParams.delete(key);
    }
  });
};
