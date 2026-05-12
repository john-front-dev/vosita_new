import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { routes } from '@shared/config';
import {
  type AccessRule,
  canAccess,
  getDefaultAuthorizedPath,
  getStoredAccesses,
  getStoredAccessToken,
  getStoredUser,
} from '@shared/lib';
import { AccessDeniedPage } from '@shared/ui';

export const PrivateRoute = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const token = getStoredAccessToken();

  if (!token) {
    return <Navigate to={routes.login} replace state={{ from: location }} />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }: PropsWithChildren) => {
  const token = getStoredAccessToken();
  const user = getStoredUser();
  const accesses = getStoredAccesses();

  if (token) {
    return <Navigate to={getDefaultAuthorizedPath(user, accesses)} replace />;
  }

  return children;
};

type ProtectedRouteProps = PropsWithChildren<{
  rule?: AccessRule;
}>;

export const ProtectedRoute = ({ children, rule }: ProtectedRouteProps) => {
  const user = getStoredUser();
  const accesses = getStoredAccesses();

  if (!canAccess(user, accesses, rule)) {
    return <AccessDeniedPage />;
  }

  return children;
};
