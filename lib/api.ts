import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { clearAuthSession } from './auth-session';

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  userId: number;
  userName: string;
  email: string;
  role: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  userName: string;
  email: string;
  password: string;
};

type ErrorPayload = {
  status?: string;
  detail?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
};

export class ApiError extends Error {
  status?: string;
  errors?: Record<string, string>;

  constructor(message: string, options?: { status?: string; errors?: Record<string, string> }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.errors = options?.errors;
  }
}

function resolveBaseUrl() {
  const configuredBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.trim()) {
    return configuredBaseUrl.trim().replace(/\/$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const inferredHost = typeof hostUri === 'string' ? hostUri.split(':')[0] : null;

  if (inferredHost) {
    return `http://${inferredHost}:8085`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8085';
  }

  return 'http://localhost:8085';
}

export const API_BASE_URL = resolveBaseUrl();

async function parseError(response: Response) {
  let payload: ErrorPayload | null = null;

  try {
    payload = (await response.json()) as ErrorPayload;
  } catch {
    payload = null;
  }

  const normalizedErrors = payload?.errors
    ? Object.fromEntries(
        Object.entries(payload.errors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
      )
    : undefined;

  const message =
    payload?.detail ||
    payload?.message ||
    payload?.error ||
    `Request failed with status ${response.status}`;

  throw new ApiError(message, {
    status: payload?.status,
    errors: normalizedErrors,
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuthSession();
    }

    await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function login(payload: LoginPayload) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout(token: string) {
  return request<void>('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getCurrentUser(token: string) {
  return request<{
    id: number;
    userName: string;
    email: string;
    role: string | null;
  }>('/api/users/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
