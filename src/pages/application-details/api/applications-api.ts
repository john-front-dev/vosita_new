import { apiRoutes } from '@shared/api/routes';

import type { ApplicationListType } from '../model/types';

export const applicationListEndpoints: Record<ApplicationListType, string> = apiRoutes.applications.list;

export const applicationEndpoints = {
  ...apiRoutes.applications,
  issue: apiRoutes.applications.issue,
} as const;

export const applicationDictionaryEndpoints = {
  tmzCategories: apiRoutes.applications.tmzCategories,
} as const;
