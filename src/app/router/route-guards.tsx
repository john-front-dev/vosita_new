import { type PropsWithChildren, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { queryClient } from '@shared/api';
import { routes } from '@shared/config';
import {
  type AccessRule,
  canAccess,
  clearAuthSession,
  getDefaultAuthorizedPath,
  getStoredAccesses,
  getStoredAccessToken,
  getStoredUser,
  hasStoredAuthSessionData,
} from '@shared/lib';
import { AccessDeniedPage } from '@shared/ui';

const useStoredSession = () => {
  const token = getStoredAccessToken();
  const user = getStoredUser();
  const accesses = getStoredAccesses();
  const isAuthenticated = Boolean(token && user);
  const shouldClearSession = !isAuthenticated && hasStoredAuthSessionData();

  useEffect(() => {
    if (!shouldClearSession) return;

    clearAuthSession();
    queryClient.clear();
  }, [shouldClearSession]);

  return { accesses, isAuthenticated, user };
};

export const PrivateRoute = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const { isAuthenticated } = useStoredSession();

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace state={{ from: location }} />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }: PropsWithChildren) => {
  const { accesses, isAuthenticated, user } = useStoredSession();

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthorizedPath(user, accesses)} replace />;
  }

  return children;
};

export const DefaultRoute = () => {
  const { accesses, isAuthenticated, user } = useStoredSession();

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />;
  }

  return <Navigate to={getDefaultAuthorizedPath(user, accesses)} replace />;
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
