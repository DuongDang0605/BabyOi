import type { AuthResponse } from './api';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-storage';
import { Platform } from 'react-native';

const AUTH_SESSION_STORAGE_KEY = 'babyoi_auth_session';

let authSession: AuthResponse | null = null;

export async function setAuthSession(session: AuthResponse | null) {
  authSession = session;

  if (Platform.OS === 'web') {
    // Browser sessions stay in memory. The long-lived refresh token is held
    // exclusively by the backend-issued HttpOnly cookie.
    await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  if (session) {
    await setSecureItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    return;
  }

  await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
}

export async function hydrateAuthSession() {
  if (authSession) {
    return authSession;
  }

  if (Platform.OS === 'web') {
    // Remove sessions written by older builds that stored tokens in localStorage.
    await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }

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

export function getRefreshToken() {
  return authSession?.refreshToken ?? null;
}

export function getAuthorizationHeader() {
  const accessToken = getAccessToken();
  return accessToken ? `Bearer ${accessToken}` : null;
}
