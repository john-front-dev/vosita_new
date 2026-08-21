import type { ApplicationDetailsStatus } from './types';

export const applicationDetailsTabs: Array<{
  apiStatus: number;
  label: string;
  value: ApplicationDetailsStatus;
}> = [
  {
    apiStatus: 1,
    label: 'Не рассмотрено',
    value: 'not-reviewed',
  },
  {
    apiStatus: 4,
    label: 'Оплачено',
    value: 'paid',
  },
  {
    apiStatus: 7,
    label: 'Распределено',
    value: 'accepted',
  },
];

export const defaultApplicationDetailsStatus: ApplicationDetailsStatus = 'not-reviewed';

export const isApplicationDetailsStatus = (
  value: string | null,
): value is ApplicationDetailsStatus => applicationDetailsTabs.some((tab) => tab.value === value);

export const getApplicationDetailsApiStatus = (status: ApplicationDetailsStatus) =>
  applicationDetailsTabs.find((tab) => tab.value === status)?.apiStatus ?? 1;
