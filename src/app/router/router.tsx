import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from '@pages/home';
import { LoginPage } from '@pages/login';

import { routes } from '@shared/config';

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <HomePage />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
]);
