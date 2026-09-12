export const employeeDetailsEndpoints = {
  actionDetails: (id: number | string) => `/history/${id}`,
  responsibleMbp: '/mbp',
} as const;
