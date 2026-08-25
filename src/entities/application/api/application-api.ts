export const applicationListEndpoints = {
  'fixed-assets': '/accountant/requests/',
  lri: '/requests/',
  mbp: '/mbp/requests/',
  other: '/other/requests/',
  tmz: '/tmz/requests/',
} as const;

export const applicationEndpoints = {
  action: '/accountant/subrequest/status',
  create: '/accountant/requests/',
  createSubrequest: '/accountant/subrequests',
  deleteSubrequests: (ids: string) => `/accountant/subrequests/${ids}`,
  details: (id: string) => `/accountant/subrequests/${id}`,
  downloadInvoice: (id: number | string) => `/invoices/${id}`,
  editSubrequest: (id: number | string) => `/accountant/subrequests/${id}`,
  invoices: (id: number | string) => `/accountant/requests/${id}/invoices`,
  issue: {
    'fixed-assets': '/accountant/issue',
    lri: '/accountant/pau/',
    mbp: '/accountant/mbp/',
    other: '/accountant/issue/',
    tmz: '/accountant/tmz/',
  },
  uploadReceipt: (ids: string) => `/accountant/upload-file-image/${ids}`,
  uploadSubrequests: '/upload/subrequests',
} as const;

export const applicationDictionaryEndpoints = {
  tmzCategories: '/tmz_categories',
} as const;
