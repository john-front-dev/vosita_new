import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@app/layouts';
import { AmortizationPage } from '@pages/amortization';
import { ApplicationDetailsPage } from '@pages/application-details';
import { ApplicationsPage } from '@pages/applications';
import { ChangePasswordPage } from '@pages/change-password';
import { FixedAssetsPage } from '@pages/fixed-assets';
import { HomePage } from '@pages/home';
import { LoginPage } from '@pages/login';
import { LriPage } from '@pages/lri';
import { PlaceholderPage } from '@pages/placeholder';
import { ResetPasswordPage } from '@pages/reset-password';
import { StockPage } from '@pages/stock';
import { StockAssetDetailsPage } from '@pages/stock-asset-details';

import { accessRules, routes } from '@shared/config';
import type { AccessRule } from '@shared/lib';

import { PrivateRoute, ProtectedRoute, PublicOnlyRoute } from './route-guards';

const withAccess = (element: React.ReactNode, rule?: AccessRule) => (
  <ProtectedRoute rule={rule}>{element}</ProtectedRoute>
);

const appRoutes = [
  { path: routes.home, element: <HomePage /> },
  { path: routes.applications, element: withAccess(<ApplicationsPage />, accessRules.request) },
  {
    path: routes.applicationsFa,
    element: withAccess(<PlaceholderPage title="Запросы ОС" />, accessRules.request),
  },
  {
    path: routes.applicationsFaDetails,
    element: withAccess(<ApplicationDetailsPage type="fixed-assets" />, accessRules.request),
  },
  {
    path: routes.applicationsLri,
    element: withAccess(<PlaceholderPage title="Запросы ПАУ" />, accessRules.request),
  },
  {
    path: routes.applicationsLriDetails,
    element: withAccess(<ApplicationDetailsPage type="lri" />, accessRules.request),
  },
  {
    path: routes.applicationsTmz,
    element: withAccess(<PlaceholderPage title="Запросы ТМЗ" />, accessRules.request),
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
    element: withAccess(
      <PlaceholderPage title="Капитализация" />,
      accessRules.responsibleOrAccountant,
    ),
  },
  { path: routes.mbp, element: withAccess(<PlaceholderPage title="МБП" />, accessRules.mbp) },
  {
    path: routes.mbpDetails,
    element: withAccess(<PlaceholderPage title="МБП" />, accessRules.mbp),
  },
  {
    path: routes.categories,
    element: withAccess(<PlaceholderPage title="Категории" />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.employees,
    element: withAccess(
      <PlaceholderPage title="Сотрудники" />,
      accessRules.responsibleOrAccountant,
    ),
  },
  {
    path: routes.employeeDetails,
    element: withAccess(<PlaceholderPage title="Сотрудник" />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.fixedAssets,
    element: withAccess(<FixedAssetsPage />, accessRules.fixedAssets),
  },
  { path: routes.fixedAssetsMine, element: withAccess(<PlaceholderPage title="Мои ОС" />) },
  { path: routes.fixedAssetsStock, element: withAccess(<StockPage />, accessRules.warehouseData) },
  {
    path: routes.fixedAssetsDetails,
    element: withAccess(<StockAssetDetailsPage type="fixed-assets" />, accessRules.fixedAssets),
  },
  {
    path: routes.others,
    element: withAccess(<PlaceholderPage title="Другие" />, accessRules.responsibleOrAccountant),
  },
  { path: routes.tmzReport, element: withAccess(<PlaceholderPage title="ТМЗ" />, accessRules.tmz) },
  {
    path: routes.inventory,
    element: withAccess(<PlaceholderPage title="Инвентарь" />, accessRules.tmz),
  },
  {
    path: routes.inventoryStorage,
    element: withAccess(<PlaceholderPage title="Склад ТМЗ" />, accessRules.tmz),
  },
  {
    path: routes.inventoryGoods,
    element: withAccess(<PlaceholderPage title="Товары" />, accessRules.tmz),
  },
  {
    path: routes.inventoryGoodsDetails,
    element: withAccess(<PlaceholderPage title="Товар" />, accessRules.tmz),
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
    element: withAccess(<PlaceholderPage title="Корзина" />, accessRules.responsibleOrAccountant),
  },
  {
    path: routes.history,
    element: withAccess(<PlaceholderPage title="История" />, accessRules.history),
  },
  {
    path: routes.locations,
    element: withAccess(
      <PlaceholderPage title="Местоположения" />,
      accessRules.responsibleOrAccountant,
    ),
  },
  { path: routes.lri, element: withAccess(<LriPage />, accessRules.lri) },
  {
    path: routes.lriDetails,
    element: withAccess(<StockAssetDetailsPage type="lri" />, accessRules.lri),
  },
  {
    path: routes.reports,
    element: withAccess(<PlaceholderPage title="Отчёты" />, accessRules.reports),
  },
  {
    path: routes.taxGroups,
    element: withAccess(
      <PlaceholderPage title="Группа налогов" />,
      accessRules.responsibleOrAccountant,
    ),
  },
  {
    path: routes.approval,
    element: withAccess(<PlaceholderPage title="Одобрение" />, accessRules.approval),
  },
];

export const router = createBrowserRouter([
  {
    path: routes.login,
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: routes.resetPassword,
    element: <ResetPasswordPage />,
  },
  {
    path: routes.changePassword,
    element: (
      <PrivateRoute>
        <ChangePasswordPage />
      </PrivateRoute>
    ),
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
