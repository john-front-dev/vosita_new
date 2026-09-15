import { queryClient } from '@shared/api';

export const invalidateApplicationDetailsQueries = () => {
  void queryClient.invalidateQueries({ queryKey: ['application-details'] });
  void queryClient.invalidateQueries({ queryKey: ['application-invoices'] });
  void queryClient.invalidateQueries({ queryKey: ['applications'] });
};
