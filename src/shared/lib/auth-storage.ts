export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  is_warehouse_manager?: boolean;
  is_responsible_person?: boolean;
  access?: string;
};

export type AuthAccess = {
  department_id: number | null;
  storage_type: string;
  storages: {
    id: number;
    name: string;
  }[];
  subdivision_id: number | null;
  user_id: string;
};

type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
  accesses?: AuthAccess[];
};

const tokenKey = 'token';
const refreshTokenKey = 'refresh_token';
const userKey = 'user';
const accessesKey = 'accesses';

export function setAuthSession({ accessToken, refreshToken, user, accesses = [] }: AuthSession) {
  localStorage.setItem(tokenKey, accessToken);
  localStorage.setItem(userKey, JSON.stringify(user));
  localStorage.setItem(accessesKey, JSON.stringify(accesses));

  if (refreshToken) {
    localStorage.setItem(refreshTokenKey, refreshToken);
  }
}

export function clearAuthSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.removeItem(userKey);
  localStorage.removeItem(accessesKey);
}

export function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem(userKey);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(userKey);
    return null;
  }
}

export function getStoredAccessToken() {
  return localStorage.getItem(tokenKey);
}

export function getStoredAccesses(): AuthAccess[] {
  const rawAccesses = localStorage.getItem(accessesKey);

  if (!rawAccesses) {
    return [];
  }

  try {
    return JSON.parse(rawAccesses) as AuthAccess[];
  } catch {
    localStorage.removeItem(accessesKey);
    return [];
  }
}
