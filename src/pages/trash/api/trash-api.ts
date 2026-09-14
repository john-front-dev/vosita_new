export const trashEndpoints = {
  fixedAssets: '/accountant/deleted/os/',
  lri: '/pau/deleted/',
  others: '/accountant/deleted/other',
  restore: (id: number) => `/accountant/os/recover/${id}`,
} as const;
