import { z } from 'zod';

export const mbpIssueSchema = z.object({
  employeeId: z.string().min(1),
  responsibleId: z.string().min(1),
  roomId: z.string().min(1),
});

export type MbpIssueFormValues = z.infer<typeof mbpIssueSchema>;

export const mbpEditSchema = z.object({
  buildingId: z.string(),
  categoryId: z.string(),
  cityId: z.string(),
  comment: z.string(),
  currency: z.string(),
  price: z.string().refine((value) => value.trim() !== '' && Number(value) >= 0),
  responsibleId: z.string(),
  roomId: z.string(),
  serialNumber: z.string(),
  storageId: z.string(),
  unit: z.string(),
});

export type MbpEditFormValues = z.infer<typeof mbpEditSchema>;
