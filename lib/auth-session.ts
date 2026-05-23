import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

import type { AuthResponse } from './api';

const AUTH_SESSION_STORAGE_KEY = 'babyoi_auth_session';
const AUTH_CREDENTIALS_STORAGE_KEY = 'babyoi_auth_credentials';

type StoredCredentials = {
  email: string;
  password: string;
};

let authSession: AuthResponse | null = null;
let authCredentials: StoredCredentials | null = null;

export async function setAuthSession(session: AuthResponse | null, credentials?: StoredCredentials | null) {
  authSession = session;
  authCredentials = credentials ?? null;

  if (session) {
    await AsyncStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }

  if (credentials) {
    await AsyncStorage.setItem(AUTH_CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
    return;
  }

  await AsyncStorage.removeItem(AUTH_CREDENTIALS_STORAGE_KEY);
}

export async function hydrateAuthSession() {
  const rawSession = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  const rawCredentials = await AsyncStorage.getItem(AUTH_CREDENTIALS_STORAGE_KEY);

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

  if (!rawCredentials) {
    authCredentials = null;
  } else {
    try {
      authCredentials = JSON.parse(rawCredentials) as StoredCredentials;
    } catch {
      authCredentials = null;
      await AsyncStorage.removeItem(AUTH_CREDENTIALS_STORAGE_KEY);
    }
  }

  return authSession;
}

export function getAuthSession() {
  return authSession;
}

export function getAuthCredentials() {
  return authCredentials;
}

export async function clearAuthSession() {
  authSession = null;
  authCredentials = null;
  await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  await AsyncStorage.removeItem(AUTH_CREDENTIALS_STORAGE_KEY);
}

export function getAccessToken() {
  return authSession?.accessToken ?? null;
}

export function getAuthorizationHeader() {
  if (authCredentials?.email && authCredentials?.password) {
    const encoded = Buffer.from(`${authCredentials.email}:${authCredentials.password}`).toString('base64');
    return `Basic ${encoded}`;
  }

  if (authSession?.accessToken) {
    return `Bearer ${authSession.accessToken}`;
  }

  return null;
}
