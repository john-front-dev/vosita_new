export const stockAssetEndpoints = {
  capitalization: '/capitalization',
  comments: (id: number | string, resource: 'mbp' | 'stock-asset' = 'stock-asset') =>
    resource === 'mbp' ? `/mbp/item/${id}/comments` : `/os/comment/${id}`,
  details: (id: number | string) => `/accountant/os/${id}`,
  history: (id: number | string, resource: 'mbp' | 'stock-asset' = 'stock-asset') =>
    resource === 'mbp' ? `/histories/mbp/${id}` : `/histories/warehouse/${id}`,
  historyDetails: (id: number | string) => `/histories/object/${id}`,
} as const;
