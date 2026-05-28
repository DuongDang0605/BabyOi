import type { AuthResponse } from './api';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-storage';

const AUTH_SESSION_STORAGE_KEY = 'babyoi_auth_session';
const AUTH_CREDENTIALS_STORAGE_KEY = 'babyoi_auth_credentials';

let authSession: AuthResponse | null = null;
let authSessionHydrated = false;
let hydratePromise: Promise<AuthResponse | null> | null = null;

export async function setAuthSession(session: AuthResponse | null) {
  authSession = session;
  authSessionHydrated = true;

  if (session) {
    await setSecureItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    return;
  }

  await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
}

export async function hydrateAuthSession() {
  if (authSessionHydrated) {
    return authSession;
  }

  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = hydrateAuthSessionFromStorage();
  return hydratePromise;
}

async function hydrateAuthSessionFromStorage() {
  const rawValue = await getSecureItem(AUTH_SESSION_STORAGE_KEY);

  if (!rawValue) {
    authSession = null;
    authSessionHydrated = true;
    hydratePromise = null;
    return null;
  }

  try {
    authSession = JSON.parse(rawValue) as AuthResponse;
    authSessionHydrated = true;
    hydratePromise = null;
    return authSession;
  } catch {
    authSession = null;
    await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
    authSessionHydrated = true;
    hydratePromise = null;
    return null;
  }
}

export function getAuthSession() {
  return authSession;
}

export async function clearAuthSession() {
  authSession = null;
  authSessionHydrated = true;

  await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
  await deleteSecureItem(AUTH_CREDENTIALS_STORAGE_KEY);
}

export function getAccessToken() {
  return authSession?.accessToken ?? null;
}

export function getAuthorizationHeader() {
  if (authSession?.accessToken) {
    return `Bearer ${authSession.accessToken}`;
  }

  return null;
}
