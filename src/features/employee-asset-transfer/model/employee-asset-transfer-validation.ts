import { z } from 'zod';

const requiredId = z.string().min(1, 'Выберите значение');

export const employeeAssetTransferSchema = z.object({
  buildingId: requiredId,
  cabinetId: requiredId,
  cityId: requiredId,
  responsibleId: requiredId,
});

export type EmployeeAssetTransferFormValues = z.infer<typeof employeeAssetTransferSchema>;
