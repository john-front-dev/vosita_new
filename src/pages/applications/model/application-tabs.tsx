import {
  OutlineSystemFileAccept,
  OutlineSystemFolder,
  OutlineSystemGridView,
  OutlineSystemShoppingBasket,
} from 'alif-ui';

import type { ApplicationTab } from './types';

export const applicationTabs: ApplicationTab[] = [
  {
    icon: <OutlineSystemFolder />,
    label: 'ОС',
    storageType: 'OS',
    value: 'fixed-assets',
  },
  {
    icon: <OutlineSystemFileAccept />,
    label: 'ПАУ',
    storageType: 'PAU',
    value: 'lri',
  },
  {
    icon: <OutlineSystemShoppingBasket />,
    label: 'ТМЗ',
    storageType: 'TMZ',
    value: 'tmz',
  },
  {
    icon: <OutlineSystemShoppingBasket />,
    label: 'МБП',
    storageType: 'MBP',
    value: 'mbp',
  },
  {
    icon: <OutlineSystemGridView />,
    label: 'Другие',
    storageType: 'Other',
    value: 'other',
  },
];
