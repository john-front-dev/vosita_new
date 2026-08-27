import {
  OutlineFinanceAnalytics,
  OutlineFinanceDollar,
  OutlineFinancePercent,
  OutlineSystemClock,
  OutlineSystemFileAccept,
  OutlineSystemFolder,
  OutlineSystemGridView,
  OutlineSystemHomeFavourite,
  OutlineSystemMapPin,
  OutlineSystemMoreHorizontal,
  OutlineSystemShoppingBasket,
  OutlineSystemSurvey,
  OutlineSystemTrash,
  OutlineSystemUser,
  OutlineSystemUsers,
} from 'alif-ui';
import type { ReactNode } from 'react';

import { accessRules, routes } from '@shared/config';
import type { AccessRule } from '@shared/lib';

export type SidebarNavItem = {
  title: string;
  path: string;
  icon?: ReactNode;
  access?: AccessRule;
  children?: SidebarNavItem[];
};

export const sidebarNavigation: SidebarNavItem[] = [
  {
    title: 'Запросы',
    path: routes.applications,
    icon: <OutlineSystemFileAccept />,
    access: accessRules.request,
  },
  {
    title: 'Склад',
    path: routes.fixedAssetsStock,
    icon: <OutlineSystemHomeFavourite />,
    access: accessRules.warehouseData,
  },
  {
    title: 'ОС',
    path: routes.fixedAssets,
    icon: <OutlineSystemFolder />,
    access: accessRules.fixedAssets,
    children: [
      {
        title: 'Амортизация',
        path: routes.amortizationFixedAssets,
        icon: <OutlineFinanceAnalytics />,
      },
    ],
  },
  {
    title: 'ПАУ',
    path: routes.lri,
    icon: <OutlineSystemFolder />,
    access: accessRules.lri,
    children: [
      {
        title: 'Амортизация',
        path: routes.amortizationLri,
        icon: <OutlineFinanceAnalytics />,
      },
    ],
  },
  {
    title: 'ТМЗ',
    path: routes.tmzReport,
    icon: <OutlineSystemShoppingBasket />,
    access: accessRules.tmz,
  },
  {
    title: 'МБП',
    path: routes.mbp,
    icon: <OutlineSystemShoppingBasket />,
    access: accessRules.mbp,
  },
  {
    title: 'Другие',
    path: routes.others,
    icon: <OutlineSystemGridView />,
    access: accessRules.responsibleOrAccountant,
  },
  {
    title: 'Одобрение',
    path: routes.approval,
    icon: <OutlineSystemFileAccept />,
    access: accessRules.approval,
  },
  {
    title: 'Мои ОС',
    path: routes.fixedAssetsMine,
    icon: <OutlineSystemUser />,
  },
  {
    title: 'История',
    path: routes.history,
    icon: <OutlineSystemClock />,
    access: accessRules.history,
  },
  {
    title: 'Больше',
    path: routes.employees,
    icon: <OutlineSystemMoreHorizontal />,
    access: accessRules.responsibleOrAccountant,
    children: [
      { title: 'Сотрудники', path: routes.employees, icon: <OutlineSystemUsers /> },
      { title: 'Капитализация', path: routes.capitalization, icon: <OutlineFinanceDollar /> },
      { title: 'Местоположения', path: routes.locations, icon: <OutlineSystemMapPin /> },
      { title: 'Категории', path: routes.categories, icon: <OutlineSystemSurvey /> },
      { title: 'Группа налогов', path: routes.taxGroups, icon: <OutlineFinancePercent /> },
      { title: 'Корзина', path: routes.trash, icon: <OutlineSystemTrash /> },
    ],
  },
];
