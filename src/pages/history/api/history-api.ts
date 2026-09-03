export const historyEndpoints = {
  list: '/histories/',
  details: (id: number | string) => `/history/${id}`,
} as const;
