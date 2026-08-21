export const serializeQueryParams = (params?: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      const normalizedValue = value
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean);

      if (normalizedValue.length) {
        searchParams.set(key, normalizedValue.join(','));
      }

      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};
