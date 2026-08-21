export const stockAssetEndpoints = {
  capitalization: '/capitalization',
  comments: (id: number | string) => `/os/comment/${id}`,
  details: (id: number | string) => `/accountant/os/${id}`,
  history: (id: number | string) => `/histories/warehouse/${id}`,
  historyDetails: (historyId: number | string) => `/histories/object/${historyId}`,
} as const;
