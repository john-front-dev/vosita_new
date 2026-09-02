export const mbpActionEndpoints = {
  destroy: (id: number | string) => `/mbp/item/${id}/status/destroy`,
  edit: (id: number | string) => `/mbp/item/${id}/credentials`,
  issueToEmployee: '/mbp/item/send-to-user',
  issueToWarehouse: (id: number | string) => `/mbp/item/send-to-warehouse/${id}`,
  writeOff: (id: number | string) => `/mbp/item/${id}/status/write-off`,
} as const;
