export const apiRoutes = {
  auth: {
    login: '/auth/login',
    refreshToken: '/auth/refresh_token',
    resetPassword: (id: string) => `/auth/resetpassword/${id}`,
  },
  amortization: {
    download: '/amortization/report/excel/',
    fixedAssets: '/amortization/report/',
    lri: '/amortization/pau',
  },
  lri: {
    list: '/accountant/os/',
  },
  applications: {
    list: {
      'fixed-assets': '/accountant/requests/',
      lri: '/requests/',
      mbp: '/mbp/requests/',
      other: '/other/requests/',
      tmz: '/tmz/requests/',
    },
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
    tmzCategories: '/tmz_categories',
    uploadReceipt: (ids: string) => `/accountant/upload-file-image/${ids}`,
    uploadSubrequests: '/upload/subrequests',
  },
  stock: {
    download: '/os/warehouse/excel/',
    list: {
      'fixed-assets': '/accountant/os/',
      lri: '/accountant/os/',
    },
  },
  stockAsset: {
    capitalization: '/capitalization',
    comments: (id: number | string) => `/os/comment/${id}`,
    details: (id: number | string) => `/accountant/os/${id}`,
    history: (id: number | string) => `/histories/warehouse/${id}`,
    historyDetails: (id: number | string) => `/histories/object/${id}`,
  },
  stockAssetActions: {
    delete: (id: number | string) => `/accountant/os/delete/${id}`,
    edit: (id: number | string, segment: 'os' | 'pau') =>
      `/accountant/${segment}/edit/${id}`,
    issue: (id: number | string, segment: 'os' | 'pau') =>
      `/accountant/${segment}/issue/${id}`,
    repair: (id: number | string) => `/accountant/os/repair/${id}`,
  },
} as const;
