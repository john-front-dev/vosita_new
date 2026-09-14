import { lazy } from 'react';

export const AmortizationPage = lazy(() =>
  import('@pages/amortization').then((module) => ({ default: module.AmortizationPage })),
);
export const ApplicationDetailsPage = lazy(() =>
  import('@pages/application-details').then((module) => ({
    default: module.ApplicationDetailsPage,
  })),
);
export const ApplicationsPage = lazy(() =>
  import('@pages/applications').then((module) => ({ default: module.ApplicationsPage })),
);
export const ApprovalPage = lazy(() =>
  import('@pages/approval').then((module) => ({ default: module.ApprovalPage })),
);
export const CapitalizationPage = lazy(() =>
  import('@pages/capitalization').then((module) => ({ default: module.CapitalizationPage })),
);
export const CategoriesPage = lazy(() =>
  import('@pages/categories').then((module) => ({ default: module.CategoriesPage })),
);
export const ChangePasswordPage = lazy(() =>
  import('@pages/change-password').then((module) => ({ default: module.ChangePasswordPage })),
);
export const EmployeeDetailsPage = lazy(() =>
  import('@pages/employee-details').then((module) => ({ default: module.EmployeeDetailsPage })),
);
export const EmployeesPage = lazy(() =>
  import('@pages/employees').then((module) => ({ default: module.EmployeesPage })),
);
export const FixedAssetsPage = lazy(() =>
  import('@pages/fixed-assets').then((module) => ({ default: module.FixedAssetsPage })),
);
export const HistoryPage = lazy(() =>
  import('@pages/history').then((module) => ({ default: module.HistoryPage })),
);
export const HomePage = lazy(() =>
  import('@pages/home').then((module) => ({ default: module.HomePage })),
);
export const LocationsPage = lazy(() =>
  import('@pages/locations').then((module) => ({ default: module.LocationsPage })),
);
export const LoginPage = lazy(() =>
  import('@pages/login').then((module) => ({ default: module.LoginPage })),
);
export const LriPage = lazy(() =>
  import('@pages/lri').then((module) => ({ default: module.LriPage })),
);
export const MbpPage = lazy(() =>
  import('@pages/mbp').then((module) => ({ default: module.MbpPage })),
);
export const MbpDetailsPage = lazy(() =>
  import('@pages/mbp-details').then((module) => ({ default: module.MbpDetailsPage })),
);
export const MyFixedAssetsPage = lazy(() =>
  import('@pages/my-fixed-assets').then((module) => ({ default: module.MyFixedAssetsPage })),
);
export const OthersPage = lazy(() =>
  import('@pages/others').then((module) => ({ default: module.OthersPage })),
);
export const PlaceholderPage = lazy(() =>
  import('@pages/placeholder').then((module) => ({ default: module.PlaceholderPage })),
);
export const ResetPasswordPage = lazy(() =>
  import('@pages/reset-password').then((module) => ({ default: module.ResetPasswordPage })),
);
export const StockPage = lazy(() =>
  import('@pages/stock').then((module) => ({ default: module.StockPage })),
);
export const StockAssetDetailsPage = lazy(() =>
  import('@pages/stock-asset-details').then((module) => ({
    default: module.StockAssetDetailsPage,
  })),
);
export const TaxGroupsPage = lazy(() =>
  import('@pages/tax-groups').then((module) => ({ default: module.TaxGroupsPage })),
);
export const TmzCategoriesPage = lazy(() =>
  import('@pages/tmz-categories').then((module) => ({ default: module.TmzCategoriesPage })),
);
export const TmzGoodDetailsPage = lazy(() =>
  import('@pages/tmz-good-details').then((module) => ({ default: module.TmzGoodDetailsPage })),
);
export const TmzGoodsPage = lazy(() =>
  import('@pages/tmz-goods').then((module) => ({ default: module.TmzGoodsPage })),
);
export const TmzReportPage = lazy(() =>
  import('@pages/tmz-report').then((module) => ({ default: module.TmzReportPage })),
);
export const TrashPage = lazy(() =>
  import('@pages/trash').then((module) => ({ default: module.TrashPage })),
);
