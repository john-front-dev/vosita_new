export const approvalEndpoints = {
  list: '/reserve/operations',
  approve: '/reserve/operations/confirm',
  reject: '/reserve/operations/cancel',
  invoice: (id: number) => `/reserve/operations/invoice/${id}`,
} as const;
