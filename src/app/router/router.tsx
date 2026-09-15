import { Suspense } from 'react';
import { Loader } from 'alif-ui';
import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@app/layouts';

import { accessRules, routes } from '@shared/config';
import type { AccessRule } from '@shared/lib';

import {
  AmortizationPage,
  ApplicationDetailsPage,
  ApplicationsPage,
  ApprovalPage,
  CapitalizationPage,
  CategoriesPage,
  ChangePasswordPage,
  EmployeeDetailsPage,
  EmployeesPage,
  FixedAssetsPage,
  HistoryPage,
  LocationsPage,
  LoginPage,
  LriPage,
  MbpDetailsPage,
  MbpPage,
  MyFixedAssetsPage,
  OthersPage,
  ResetPasswordPage,
  StockAssetDetailsPage,
  StockPage,
  TaxGroupsPage,
  TmzCategoriesPage,
  TmzGoodDetailsPage,
  TmzGoodsPage,
  TmzReportPage,
  TrashPage,
} from './lazy-pages';
import { DefaultRoute, PrivateRoute, ProtectedRoute, PublicOnlyRoute } from './route-guards';

const routeFallback = (
  <div className="flex h-screen items-center justify-center">
    <Loader />
  </div>
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={routeFallback}>{element}</Suspense>
);

const withAccess = (element: React.ReactNode, rule?: AccessRule) => (
  <ProtectedRoute rule={rule}>{withSuspense(element)}</ProtectedRoute>
);

const appRoutes = [
  { path: routes.home, element: <DefaultRoute /> },
  { path: routes.applications, element: withAccess(<ApplicationsPage />, accessRules.request) },
  {
    path: routes.applicationsFaDetails,
    element: withAccess(<ApplicationDetailsPage type="fixed-assets" />, accessRules.request),
  },
  {
    path: routes.applicationsLriDetails,
    element: withAccess(<ApplicationDetailsPage type="lri" />, accessRules.request),
  },
  {
    path: routes.applicationsTmzDetails,
    element: withAccess(<ApplicationDetailsPage type="tmz" />, accessRules.request),
  },
  {
    path: routes.applicationsMbpDetails,
    element: withAccess(<ApplicationDetailsPage type="mbp" />, accessRules.request),
  },
  {
    path: routes.applicationsOtherDetails,
    element: withAccess(<ApplicationDetailsPage type="other" />, accessRules.request),
  },
  {
    path: routes.capitalization,
    element: withAccess(<CapitalizationPage />, accessRules.responsibleOrAccountant),
  },
  { path: routes.mbp, element: withAccess(<MbpPage />, accessRules.mbp) },
  {
    path: routes.mbpDetails,
    element: withAccess(<MbpDetailsPage />, accessRules.mbp),
  },
  {
    path: routes.categories,
    element: withAccess(<CategoriesPage />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.employees,
    element: withAccess(<EmployeesPage />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.employeeDetails,
    element: withAccess(<EmployeeDetailsPage />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.fixedAssets,
    element: withAccess(<FixedAssetsPage />, accessRules.fixedAssets),
  },
  { path: routes.fixedAssetsMine, element: withAccess(<MyFixedAssetsPage />) },
  { path: routes.fixedAssetsStock, element: withAccess(<StockPage />, accessRules.warehouseData) },
  {
    path: routes.fixedAssetsDetails,
    element: withAccess(<StockAssetDetailsPage type="fixed-assets" />, accessRules.fixedAssets),
  },
  {
    path: routes.others,
    element: withAccess(<OthersPage />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.othersDetails,
    element: withAccess(
      <StockAssetDetailsPage type="other" />,
      accessRules.responsibleOrAccountant,
    ),
  },
  { path: routes.tmzReport, element: withAccess(<TmzReportPage />, accessRules.tmz) },
  {
    path: routes.inventory,
    element: withAccess(<TmzCategoriesPage />, accessRules.tmz),
  },
  {
    path: routes.inventoryStorage,
    element: withAccess(<TmzCategoriesPage />, accessRules.tmz),
  },
  {
    path: routes.inventoryGoods,
    element: withAccess(<TmzGoodsPage />, accessRules.tmz),
  },
  {
    path: routes.inventoryGoodsDetails,
    element: withAccess(<TmzGoodDetailsPage />, accessRules.tmz),
  },
  {
    path: routes.amortizationFixedAssets,
    element: withAccess(<AmortizationPage type="fixed-assets" />, accessRules.fixedAssets),
  },
  {
    path: routes.amortizationLri,
    element: withAccess(<AmortizationPage type="lri" />, accessRules.lri),
  },
  {
    path: routes.trash,
    element: withAccess(<TrashPage />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.history,
    element: withAccess(<HistoryPage />, accessRules.history),
  },
  {
    path: routes.locations,
    element: withAccess(<LocationsPage />, accessRules.responsibleOrAccountant),
  },
  { path: routes.lri, element: withAccess(<LriPage />, accessRules.lri) },
  {
    path: routes.lriDetails,
    element: withAccess(<StockAssetDetailsPage type="lri" />, accessRules.lri),
  },
  {
    path: routes.taxGroups,
    element: withAccess(<TaxGroupsPage />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.approval,
    element: withAccess(<ApprovalPage />, accessRules.approval),
  },
];

export const router = createBrowserRouter([
  {
    path: routes.login,
    element: <PublicOnlyRoute>{withSuspense(<LoginPage />)}</PublicOnlyRoute>,
  },
  {
    path: routes.resetPassword,
    element: withSuspense(<ResetPasswordPage />),
  },
  {
    path: routes.changePassword,
    element: <PrivateRoute>{withSuspense(<ChangePasswordPage />)}</PrivateRoute>,
  },
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: appRoutes,
  },
]);
