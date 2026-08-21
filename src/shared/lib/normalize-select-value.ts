export const normalizeSelectValue = (value: unknown) => {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return String(value.value);
  }

  return value ? String(value) : '';
};
