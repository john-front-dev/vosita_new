import { useGetQuery } from '@shared/api';

import { employeeDetailsEndpoints } from '../api/employee-details-api';

export type EmployeeActionDetails = {
  date?: number | string;
  description?: string;
  id?: number;
  initiator?: string;
  inventory_number?: string;
  new_alif_category?: string;
  new_comment?: string;
  new_department?: string;
  new_employee?: string;
  new_employee_uuid?: string;
  new_name?: string;
  new_price?: number | string;
  new_room?: string;
  new_status?: string;
  new_subdivision?: string;
  new_warehouse_manager?: string;
  old_comment?: string;
  old_employee?: string;
  old_employee_uuid?: string;
  old_name?: string;
  old_responsible_person?: string;
  old_room?: string;
  old_status?: string;
  old_warehouse_manager?: string;
  operation_type?: string;
};

type EmployeeActionDetailsPayload = EmployeeActionDetails | { payload?: EmployeeActionDetails[] };

export const useEmployeeActionDetails = (actionId: number | null) => {
  const query = useGetQuery<ApiResponse<EmployeeActionDetailsPayload>>({
    queryKey: ['employee-action-details', actionId],
    url: employeeDetailsEndpoints.actionDetails(actionId ?? ''),
    options: { enabled: actionId !== null },
  });
  const payload = query.data?.payload;
  const action =
    payload && 'payload' in payload && Array.isArray(payload.payload)
      ? payload.payload[0]
      : (payload as EmployeeActionDetails | undefined);

  return { ...query, action };
};
