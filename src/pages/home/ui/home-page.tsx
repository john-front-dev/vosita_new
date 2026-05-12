import { Navigate } from 'react-router-dom';

import { getDefaultAuthorizedPath, getStoredAccesses, getStoredUser } from '@shared/lib';

export const HomePage = () => {
  return <Navigate to={getDefaultAuthorizedPath(getStoredUser(), getStoredAccesses())} replace />;
};
