import { z } from 'zod';

import type { LocationType } from './types';

const locationFormSchema = z.object({
  buildingId: z.string(),
  cityId: z.string(),
  crmId: z.string(),
  endDate: z.string(),
  name: z.string().trim().min(1, 'Введите название'),
  responsibleId: z.string(),
  responsibleText: z.string(),
  startDate: z.string(),
  storageTypeId: z.string(),
});

export const createLocationFormSchema = (type: LocationType, isEdit: boolean) =>
  locationFormSchema.superRefine((values, context) => {
    if (type === 'cities') return;

    if (!values.cityId) {
      context.addIssue({ code: 'custom', message: 'Выберите город', path: ['cityId'] });
    }

    if (type === 'buildings') {
      if (!values.responsibleText.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'Введите ответственное лицо',
          path: ['responsibleText'],
        });
      }
      if (!values.startDate) {
        context.addIssue({ code: 'custom', message: 'Выберите дату начала', path: ['startDate'] });
      }
      if (!values.endDate) {
        context.addIssue({ code: 'custom', message: 'Выберите дату окончания', path: ['endDate'] });
      }
      if (values.startDate && values.endDate && values.startDate > values.endDate) {
        context.addIssue({
          code: 'custom',
          message: 'Дата окончания должна быть не раньше даты начала',
          path: ['endDate'],
        });
      }
      return;
    }

    if (!values.buildingId) {
      context.addIssue({ code: 'custom', message: 'Выберите здание', path: ['buildingId'] });
    }

    if (type === 'cabinets' && !isEdit && !values.responsibleId) {
      context.addIssue({
        code: 'custom',
        message: 'Выберите ответственное лицо',
        path: ['responsibleId'],
      });
    }

    if (type === 'warehouses') {
      if (isEdit && !values.responsibleId) {
        context.addIssue({
          code: 'custom',
          message: 'Выберите ответственное лицо',
          path: ['responsibleId'],
        });
      }
      if (!isEdit && !values.storageTypeId) {
        context.addIssue({
          code: 'custom',
          message: 'Выберите тип товара',
          path: ['storageTypeId'],
        });
      }
    }
  });
