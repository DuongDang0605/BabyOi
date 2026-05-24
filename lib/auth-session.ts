import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthResponse } from './api';

const AUTH_SESSION_STORAGE_KEY = 'babyoi_auth_session';
const AUTH_CREDENTIALS_STORAGE_KEY = 'babyoi_auth_credentials';

let authSession: AuthResponse | null = null;

export async function setAuthSession(session: AuthResponse | null) {
  authSession = session;

  if (session) {
    await AsyncStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }

  await AsyncStorage.removeItem(AUTH_CREDENTIALS_STORAGE_KEY);
}

export async function hydrateAuthSession() {
  const rawSession = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!rawSession) {
    authSession = null;
  } else {
    try {
      authSession = JSON.parse(rawSession) as AuthResponse;
    } catch {
      authSession = null;
      await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  await AsyncStorage.removeItem(AUTH_CREDENTIALS_STORAGE_KEY);

  return authSession;
}

export function getAuthSession() {
  return authSession;
}

export async function clearAuthSession() {
  authSession = null;
  await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  await AsyncStorage.removeItem(AUTH_CREDENTIALS_STORAGE_KEY);
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
