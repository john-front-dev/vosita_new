export const capitalizationEndpoints = {
  list: '/capitalization/',
  details: (id: number | string) => `/capitalization/${id}`,
  remove: (id: number | string) => `/capitalization/${id}`,
} as const;
