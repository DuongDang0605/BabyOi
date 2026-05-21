import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { clearAuthSession, getAccessToken } from './auth-session';

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

export type FoodNutritionResponse = {
  id: number;
  totalCalories: number | null;
  totalCaloriesUnit: string | null;
  totalProtein: number | null;
  totalProteinUnit: string | null;
  totalCarbs: number | null;
  totalCarbsUnit: string | null;
  totalFat: number | null;
  totalFatUnit: string | null;
  totalFiber: number | null;
  totalFiberUnit: string | null;
  totalSugar: number | null;
  totalSugarUnit: string | null;
  totalSodium: number | null;
  totalSodiumUnit: string | null;
};

export type IngredientNutritionResponse = {
  id: number;
  baseAmount: number | null;
  baseUnit: string | null;
  calories: number | null;
  caloriesUnit: string | null;
  protein: number | null;
  proteinUnit: string | null;
  carbs: number | null;
  carbsUnit: string | null;
  fat: number | null;
  fatUnit: string | null;
  fiber: number | null;
  fiberUnit: string | null;
  sugar: number | null;
  sugarUnit: string | null;
  sodium: number | null;
  sodiumUnit: string | null;
  status: number | null;
};

export type FoodIngredientResponse = {
  id: number;
  foodIngredientId: number | null;
  nameIngredients: string | null;
  imageUrl: string | null;
  amountPerServing: number | null;
  unit: string | null;
  status: number | null;
  description: string | null;
  nutrition: IngredientNutritionResponse | null;
};

export type FoodRecommendationResponse = {
  id: number;
  goodPoints: string | null;
  badPoints: string | null;
  advice: string | null;
  cookingWay: string | null;
  status: number | null;
};


export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
export type FoodResponse = {
  id: number;
  functionCode: number | null;
  name: string;
  imageUrl: string | null;
  advanceFor: string | null;
  status: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  nutrition: FoodNutritionResponse | null;
  recommendation: FoodRecommendationResponse | null;
  ingredients: FoodIngredientResponse[] | null;
};

export type FavoriteFoodResponse = {
  id: number;
  userId: number | null;
  foodId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  food: FoodResponse | null;
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

export function resolveAssetUrl(url?: string | null) {
  const rawValue = url?.trim();
  if (!rawValue) {
    return '';
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  const normalizedPath = rawValue.replace(/^file:\/\//i, '').replace(/\\/g, '/');
  const staticMarker = '/src/main/resources/static/';
  const staticMarkerIndex = normalizedPath.toLowerCase().indexOf(staticMarker);

  if (staticMarkerIndex >= 0) {
    const publicPath = normalizedPath.slice(staticMarkerIndex + staticMarker.length);
    return `${API_BASE_URL}/${publicPath.replace(/^\/+/, '')}`;
  }

  const knownStaticFolder = normalizedPath.match(/\/(Ingredient|Food)\/.+/i);
  if (knownStaticFolder) {
    return `${API_BASE_URL}${knownStaticFolder[0]}`;
  }

  return `${API_BASE_URL}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
}

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


function buildQueryString(params: Record<string, string | number | null | undefined>) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `?${query}` : '';
}
export function getFoods() {
  return request<FoodResponse[]>('/api/foods');
}


export function getFoodsPage(params: { page?: number; size?: number; functionCode?: number | null; advanceFor?: string | null; search?: string }) {
  return request<PageResponse<FoodResponse>>(`/api/foods/page${buildQueryString(params)}`);
}
export function getFoodDetail(foodId: number | string) {
  return request<FoodResponse>(`/api/foods/detail/${foodId}`);
}

export function getFoodIngredients(foodId: number | string) {
  return request<FoodIngredientResponse[]>(`/api/foods/${foodId}/ingredients`);
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getFavoriteFoods(userId: number | string) {
  return request<FoodResponse[]>(`/api/foods/favorites/user/${userId}`, {
    method: 'GET',
    headers: authHeaders(),
  });
}

export function addFavoriteFood(userId: number | string, foodId: number | string) {
  return request<FavoriteFoodResponse>(`/api/foods/favorites/user/${userId}/food/${foodId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export function deleteFavoriteFood(userId: number | string, foodId: number | string) {
  return request<void>(`/api/foods/favorites/user/${userId}/food/${foodId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export function getRestrictedFoods(userId: number | string) {
  return request<FoodResponse[]>(`/api/foods/restricted/user/${userId}`, {
    method: 'GET',
    headers: authHeaders(),
  });
}

export function addRestrictedFood(userId: number | string, foodId: number | string) {
  return request<FavoriteFoodResponse>(`/api/foods/restricted/user/${userId}/food/${foodId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export function deleteRestrictedFood(userId: number | string, foodId: number | string) {
  return request<void>(`/api/foods/restricted/user/${userId}/food/${foodId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}