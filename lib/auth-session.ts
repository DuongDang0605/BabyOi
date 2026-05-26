import type { AuthResponse } from './api';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-storage';

const AUTH_SESSION_STORAGE_KEY = 'babyoi_auth_session';

let authSession: AuthResponse | null = null;

export async function setAuthSession(session: AuthResponse | null) {
  authSession = session;

  if (session) {
    await setSecureItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    return;
  }

  await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
}

export async function hydrateAuthSession() {
  const rawValue = await getSecureItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawValue) {
    authSession = null;
    return null;
  }

  try {
    authSession = JSON.parse(rawValue) as AuthResponse;
    return authSession;
  } catch {
    authSession = null;
    await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

export function getAuthSession() {
  return authSession;
}

export async function clearAuthSession() {
  authSession = null;
  await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
}

export function getAccessToken() {
  return authSession?.accessToken ?? null;
}
