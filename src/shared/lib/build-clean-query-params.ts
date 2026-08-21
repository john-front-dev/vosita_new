type QueryParamValue =
  | boolean
  | number
  | string
  | Array<boolean | number | string>
  | null
  | undefined;

type BuildCleanQueryParamsOptions = {
  uppercaseKeys?: boolean;
};

export type QueryParams = Record<string, QueryParamValue>;

const normalizeArrayValue = (value: Array<boolean | number | string>) =>
  value
    .map(String)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeValue = (value: QueryParamValue) => {
  if (Array.isArray(value)) {
    const normalizedValue = normalizeArrayValue(value);

    return normalizedValue.length ? normalizedValue : undefined;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim();

    return normalizedValue || undefined;
  }

  return value ?? undefined;
};

export const buildCleanQueryParams = <TParams extends QueryParams>(
  params: TParams,
  options: BuildCleanQueryParamsOptions = {},
) => {
  return Object.entries(params).reduce<QueryParams>((accumulator, [key, value]) => {
    const normalizedValue = normalizeValue(value);

    if (normalizedValue === undefined) {
      return accumulator;
    }

    accumulator[options.uppercaseKeys ? key.toUpperCase() : key] = normalizedValue;

    return accumulator;
  }, {});
};
