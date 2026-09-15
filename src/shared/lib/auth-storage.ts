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
  remember: boolean;
  refreshToken?: string;
  user: AuthUser;
  accesses?: AuthAccess[];
};

const tokenKey = 'token';
const refreshTokenKey = 'refresh_token';
const userKey = 'user';
const accessesKey = 'accesses';
const authStorageKeys = [tokenKey, refreshTokenKey, userKey, accessesKey] as const;

const getAuthStorage = () => {
  if (sessionStorage.getItem(tokenKey)) return sessionStorage;
  if (localStorage.getItem(tokenKey)) return localStorage;

  return null;
};

const clearStorage = (storage: Storage) => {
  authStorageKeys.forEach((key) => storage.removeItem(key));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isAuthUser = (value: unknown): value is AuthUser =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.full_name === 'string' &&
  typeof value.email === 'string';

const isAuthAccess = (value: unknown): value is AuthAccess =>
  isRecord(value) &&
  typeof value.storage_type === 'string' &&
  typeof value.user_id === 'string' &&
  Array.isArray(value.storages) &&
  value.storages.every(
    (storage) =>
      isRecord(storage) && typeof storage.id === 'number' && typeof storage.name === 'string',
  );

export const setAuthSession = ({
  accessToken,
  remember,
  refreshToken,
  user,
  accesses = [],
}: AuthSession) => {
  clearAuthSession();

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(tokenKey, accessToken);
  storage.setItem(userKey, JSON.stringify(user));
  storage.setItem(accessesKey, JSON.stringify(accesses));

  if (refreshToken) {
    storage.setItem(refreshTokenKey, refreshToken);
  }
};

export const updateStoredAuthTokens = ({
  accessToken,
  refreshToken,
}: Pick<AuthSession, 'accessToken' | 'refreshToken'>) => {
  const storage = getAuthStorage();

  if (!storage) return;

  storage.setItem(tokenKey, accessToken);

  if (refreshToken) {
    storage.setItem(refreshTokenKey, refreshToken);
  } else {
    storage.removeItem(refreshTokenKey);
  }
};

export const clearAuthSession = () => {
  clearStorage(localStorage);
  clearStorage(sessionStorage);
};

export const getStoredUser = (): AuthUser | null => {
  const rawUser = getAuthStorage()?.getItem(userKey);

  if (!rawUser) {
    return null;
  }

  try {
    const user: unknown = JSON.parse(rawUser);

    return isAuthUser(user) ? user : null;
  } catch {
    return null;
  }
};

export const getStoredAccessToken = () => {
  return getAuthStorage()?.getItem(tokenKey) ?? null;
};

export const hasStoredAuthSessionData = () =>
  [localStorage, sessionStorage].some((storage) =>
    authStorageKeys.some((key) => storage.getItem(key)),
  );

export const getStoredRefreshToken = () => {
  return getAuthStorage()?.getItem(refreshTokenKey) ?? null;
};

export const getStoredAccesses = (): AuthAccess[] => {
  const rawAccesses = getAuthStorage()?.getItem(accessesKey);

  if (!rawAccesses) {
    return [];
  }

  try {
    const accesses: unknown = JSON.parse(rawAccesses);

    return Array.isArray(accesses) && accesses.every(isAuthAccess) ? accesses : [];
  } catch {
    return [];
  }
};
