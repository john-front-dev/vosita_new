import { z } from 'zod';

const requiredId = z.string().min(1, 'Выберите значение');

export const fixedAssetEditSchema = z.object({
  buildingId: requiredId,
  cabinetId: requiredId,
  categoryId: requiredId,
  cityId: requiredId,
  exploiterId: z.string(),
  inventoryNumber: z.string(),
  name: z.string().trim().min(1, 'Введите наименование'),
  responsiblePersonId: z.string(),
  serialNumber: z.string(),
});
export type FixedAssetEditFormValues = z.infer<typeof fixedAssetEditSchema>;

export const lriEditSchema = z.object({
  name: z.string().trim().min(1, 'Введите наименование'),
  serialNumber: z.string(),
});
export type LriEditFormValues = z.infer<typeof lriEditSchema>;

export const issueSchema = z.object({ userId: requiredId });
export type IssueFormValues = z.infer<typeof issueSchema>;
