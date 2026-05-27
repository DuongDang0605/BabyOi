    import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { clearAuthSession, getAuthorizationHeader, hydrateAuthSession } from './auth-session';

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

export type OtpResponse = {
  email: string;
  message: string;
  expiresInMinutes: number;
};

export type OtpPayload = {
  email: string;
};

export type VerifyOtpPayload = {
  email: string;
  code: string;
};

export type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
};

export type SocialLoginPayload = {
  provider: 'GOOGLE';
  idToken?: string;
};

export type ProfileResponse = {
  id: number;
  userId: number;
  name: string;
  dateOfBirth: string;
  sex: 'MALE' | 'FEMALE' | 'OTHER' | string;
  profileType: 'MOTHER' | 'CHILD' | string;
  profileCode: string | null;
  functionCode: string | null;
  imageUrl: string | null;
  status: number | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type ProfilePayload = {
  userId: number;
  name: string;
  dateOfBirth: string;
  sex: 'MALE' | 'FEMALE' | 'OTHER';
  profileType: 'MOTHER' | 'CHILD';
  profileCode?: string | null;
  functionCode?: string | null;
  imageUrl?: string | null;
};

/* =========================
   VACCINE TYPES
========================= */

export type VaccineTypeResponse = {
  id: number;
  name: string;
  description: string | null;
  requiredAge: number | null;
};

export type VaccineRecordRequest = {
  profileId: number;
  vaccineTypeId: number;
  injectionDate: string;
  location?: string;
  note?: string;
  price?: number;
  status: number;
};

export type VaccineRecordResponse = {
  id: number;
  profileId: number;
  vaccineTypeId: number;
  vaccineTypeName: string;
  vaccineTypeDescription: string | null;
  injectionDate: string;
  location: string | null;
  price: number | null;
  note: string | null;
  status: number | null;
};

export type VaccineStatisticsResponse = {
  pending: number;
  canceled: number;
  success: number;
};

/* =========================
   FOOD TYPES
========================= */

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
  profileId: number | null;
  foodId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  food: FoodResponse | null;
};

/* =========================
   ERROR
========================= */

type ErrorPayload = {
  status?: string;
  detail?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
};

type ApiRequestInit = RequestInit & {
  skipAuth?: boolean;
};

type ProfileAvatarUploadResponse = {
  imageUrl: string;
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

/* =========================
   BASE URL CONFIG
========================= */

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

/* =========================
   ASSET URL
========================= */

export function resolveAssetUrl(url?: string | null) {
  const rawValue = url?.trim();

  if (!rawValue) {
    return '';
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  const normalizedPath = rawValue.replace(/^file:\/\//i, '').replace(/\\/g, '/');

  if (/^\/?(Ingredient|Food)\//i.test(normalizedPath)) {
    return '';
  }

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

/* =========================
   REQUEST CORE
========================= */

async function parseError(response: Response): Promise<never> {
  let payload: ErrorPayload | null = null;

  try {
    payload = (await response.json()) as ErrorPayload;
  } catch {
    payload = null;
  }

  const normalizedErrors = payload?.errors
    ? Object.fromEntries(
        Object.entries(payload.errors).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value,
        ])
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

function buildHeaders(init?: ApiRequestInit, options?: { jsonContentType?: boolean }): Record<string, string> {
  const authorizationHeader = getAuthorizationHeader();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  if (options?.jsonContentType !== false && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (!init?.skipAuth && authorizationHeader && !headers.Authorization) {
    headers.Authorization = authorizationHeader;
  }

  return headers;
}

async function request<T>(path: string, init?: ApiRequestInit): Promise<T> {
  await hydrateAuthSession();

  const { skipAuth, ...fetchInit } = init ?? {};
  const url = `${API_BASE_URL}${path}`;

  if (__DEV__) {
    console.log('[API]', fetchInit.method ?? 'GET', url);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchInit,
      headers: buildHeaders(init),
    });
  } catch (error) {
    throw error;
  }

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

async function requestMultipart<T>(path: string, formData: FormData, init?: ApiRequestInit): Promise<T> {
  await hydrateAuthSession();

  const { skipAuth, ...fetchInit } = init ?? {};
  const url = `${API_BASE_URL}${path}`;

  if (__DEV__) {
    console.log('[API]', fetchInit.method ?? 'POST', url);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchInit,
      method: fetchInit.method ?? 'POST',
      body: formData,
      headers: buildHeaders(init, { jsonContentType: false }),
    });
  } catch (error) {
    throw error;
  }

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuthSession();
    }

    await parseError(response);
  }

  return (await response.json()) as T;
}

function buildQueryString(params: Record<string, string | number | null | undefined>) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `?${query}` : '';
}

/* =========================
   AUTH API
========================= */

export function login(payload: LoginPayload) {
  return request<AuthResponse>('/api/auth/login', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function socialLogin(payload: SocialLoginPayload) {
  return request<AuthResponse>('/api/auth/social-login', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return request<OtpResponse>('/api/auth/register', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resendRegistrationOtp(payload: OtpPayload) {
  return request<OtpResponse>('/api/auth/register/resend-otp', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function cancelRegistration(payload: OtpPayload) {
  return request<void>('/api/auth/register/cancel', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyRegistration(payload: VerifyOtpPayload) {
  return request<AuthResponse>('/api/auth/register/verify', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(payload: OtpPayload) {
  return request<OtpResponse>('/api/auth/forgot-password', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyPasswordResetCode(payload: VerifyOtpPayload) {
  return request<void>('/api/auth/forgot-password/verify', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload: ResetPasswordPayload) {
  return request<void>('/api/auth/reset-password', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return request<void>('/api/auth/logout', {
    method: 'POST',
  });
}

export function getCurrentUser() {
  return request<{
    id: number;
    userName: string;
    email: string;
    role: string | null;
  }>('/api/users/me', {
    method: 'GET',
  });
}

/* =========================
   PROFILE API
========================= */

export function getProfilesByUserId(userId: number | string) {
  return request<ProfileResponse[]>(`/api/profiles/user/${userId}`, {
    method: 'GET',
  });
}

export function createProfile(payload: ProfilePayload) {
  return request<ProfileResponse>('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProfile(profileId: number | string, payload: ProfilePayload) {
  return request<ProfileResponse>(`/api/profiles/${profileId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function updateProfileAvatar(profileId: number | string, imageUrl: string) {
  return request<ProfileResponse>(`/api/profiles/${profileId}/avatar`, {
    method: 'PATCH',
    body: JSON.stringify({ imageUrl }),
  });
}

function getUploadFileName(uri: string) {
  const cleanUri = uri.split('?')[0] || uri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();
  const safeExtension = extension && extension.length <= 5 ? extension : 'jpg';
  return `profile-avatar-${Date.now()}.${safeExtension}`;
}

function getUploadMimeType(uri: string) {
  const extension = (uri.split('?')[0] || uri).split('.').pop()?.toLowerCase();
  if (extension === 'png') {
    return 'image/png';
  }
  if (extension === 'webp') {
    return 'image/webp';
  }
  return 'image/jpeg';
}

export async function uploadProfileAvatar(uri: string) {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: getUploadFileName(uri),
    type: getUploadMimeType(uri),
  } as any);

  const response = await requestMultipart<ProfileAvatarUploadResponse>('/api/profiles/avatar', formData);
  return response.imageUrl;
}

export function deleteProfile(profileId: number | string) {
  return request<void>(`/api/profiles/${profileId}`, {
    method: 'DELETE',
  });
}

/* =========================
   VACCINE API
========================= */

export function getVaccineTypes(keyword?: string) {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';

  return request<VaccineTypeResponse[]>(`/api/vaccine-types${query}`, {
    method: 'GET',
  });
}

export function createVaccineRecord(payload: VaccineRecordRequest) {
  return request<any>('/api/vaccine-records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateVaccineRecord(recordId: number | string, payload: VaccineRecordRequest) {
  return request<VaccineRecordResponse>(`/api/vaccine-records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteVaccineRecord(recordId: number | string) {
  return request<void>(`/api/vaccine-records/${recordId}`, {
    method: 'DELETE',
  });
}

export function getVaccineRecordsByProfile(profileId: number | string, params?: { status: number; limit?: number }) {
  return request<VaccineRecordResponse[]>(`/api/vaccine-records/profile/${profileId}${buildQueryString({
    status: params?.status,
    limit: params?.limit,
  })}`, {
    method: 'GET',
  });
}

export function getVaccineStatistics(profileId: number | string) {
  return request<VaccineStatisticsResponse>(`/api/vaccine-records/profile/${profileId}/statistics`, {
    method: 'GET',
  });
}

/* =========================
   FOOD API
========================= */

export function getFoods() {
  return request<FoodResponse[]>('/api/foods', {
    method: 'GET',
  });
}

export function getFoodsPage(params: {
  page?: number;
  size?: number;
  functionCode?: number | null;
  advanceFor?: string | null;
  search?: string;
}) {
  return request<PageResponse<FoodResponse>>(`/api/foods/page${buildQueryString(params)}`, {
    method: 'GET',
  });
}

export function getFoodDetail(foodId: number | string) {
  return request<FoodResponse>(`/api/foods/detail/${foodId}`, {
    method: 'GET',
  });
}

export function getFoodIngredients(foodId: number | string) {
  return request<FoodIngredientResponse[]>(`/api/foods/${foodId}/ingredients`, {
    method: 'GET',
  });
}

/* =========================
   FAVORITE FOOD API
========================= */

export function getFavoriteFoods(profileId: number | string) {
  return request<FoodResponse[]>(`/api/foods/favorites/profile/${profileId}`, {
    method: 'GET',
  });
}

export function addFavoriteFood(profileId: number | string, foodId: number | string) {
  return request<FavoriteFoodResponse>(`/api/foods/favorites/profile/${profileId}/food/${foodId}`, {
    method: 'POST',
  });
}

export function deleteFavoriteFood(profileId: number | string, foodId: number | string) {
  return request<void>(`/api/foods/favorites/profile/${profileId}/food/${foodId}`, {
    method: 'DELETE',
  });
}

/* =========================
   RESTRICTED FOOD API
========================= */

export function getRestrictedFoods(profileId: number | string) {
  return request<FoodResponse[]>(`/api/foods/restricted/profile/${profileId}`, {
    method: 'GET',
  });
}

export function addRestrictedFood(profileId: number | string, foodId: number | string) {
  return request<FavoriteFoodResponse>(`/api/foods/restricted/profile/${profileId}/food/${foodId}`, {
    method: 'POST',
  });
}

export function deleteRestrictedFood(profileId: number | string, foodId: number | string) {
  return request<void>(`/api/foods/restricted/profile/${profileId}/food/${foodId}`, {
    method: 'DELETE',
  });
}
