import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { queryClient } from '@shared/api';
import { routes } from '@shared/config';
import { AUTH_SESSION_EXPIRED_EVENT } from '@shared/lib';

import { router } from './router';

export const AppRouter = () => {
  useEffect(() => {
    const redirectToLogin = () => {
      queryClient.clear();
      void router.navigate(routes.login, { replace: true });
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, redirectToLogin);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, redirectToLogin);
    };
  }, []);

  return <RouterProvider router={router} />;
};
