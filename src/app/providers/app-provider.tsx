import { QueryClientProvider } from '@tanstack/react-query';
import { AlifProvider, SnackbarContainer } from 'alif-ui';
import type { PropsWithChildren } from 'react';

import { queryClient } from '@shared/api';

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <AlifProvider brand="aliftech" initialMode="light" initialLocale="ru">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <SnackbarContainer position="top-right" />
    </AlifProvider>
  );
}
