import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { clearAuthSession, getAuthorizationHeader, hydrateAuthSession } from './auth-session';
import { clearSelectedProfile } from './profile-session';

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
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
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
  requiredAge: string | null;
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

export type AiTeachingLessonResponse = {
  id: number;
  lessonName: string;
  description: string | null;
  reasonableAgeFromMonth: number | null;
  reasonableAgeToMonth: number | null;
  recommendedDurationDays: number | null;
  lessonNote: string | null;
  videoUrl: string | null;
  suggestedByOrganization: string | null;
  sourceUrl: string | null;
  sourceOrganization: string | null;
  iconUrl: string | null;
  sortOrder: number | null;
  status: number | null;
  progressId: number | null;
  profileId: number | null;
  progressStatus: number | null;
  startedAt: string | null;
  completedAt: string | null;
  currentDay: number | null;
  practiceCount: number | null;
  lastPracticedAt: string | null;
  progressNote: string | null;
  progressUpdatedAt: string | null;
};

export type HandbookPostResponse = {
  id: number;
  category: string;
  title: string;
  snippet: string | null;
  content: string | null;
  imageUrl: string | null;
  authorName: string | null;
  authorRole: string | null;
  publishedAt: string | null;
  commentCount: number;
};

export type HandbookCommentResponse = {
  id: number;
  postId: number;
  parentId: number | null;
  userId: number | null;
  userName: string | null;
  avatarUrl: string | null;
  content: string;
  likeCount: number | null;
  adminReply: boolean | null;
  createdAt: string | null;
  replies: HandbookCommentResponse[] | null;
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

export type AppNotificationResponse = {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string | null;
  dataJson: string | null;
  priority: number | null;
  sourceType: string | null;
  sourceId: number | null;
  status: number | null;
  read: boolean;
  readAt: string | null;
  createdAt: string | null;
};

export type NotificationSettingsResponse = {
  pushEnabled: boolean;
  vaccineEnabled: boolean;
  appointmentEnabled: boolean;
  chatEnabled: boolean;
  promotionEnabled: boolean;
  systemEnabled: boolean;
};

export type NotificationSettingsPayload = Partial<NotificationSettingsResponse>;

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

const CLOUDINARY_IMAGE_BASE_URL = 'https://res.cloudinary.com/dkerzsvan/image/upload';

function normalizeCloudinaryImageUrl(url: string) {
  const uploadMarker = '/image/upload/';
  const uploadMarkerIndex = url.indexOf(uploadMarker);

  if (!/res\.cloudinary\.com/i.test(url) || uploadMarkerIndex < 0) {
    return url;
  }

  const prefix = url.slice(0, uploadMarkerIndex + uploadMarker.length);
  const rawPath = url.slice(uploadMarkerIndex + uploadMarker.length).replace(/^\/+/, '');
  const pathParts = rawPath.split('/').filter(Boolean);

  while (
    pathParts.length > 0
    && (
      /^v\d+$/i.test(pathParts[0])
      || pathParts[0].includes(',')
      || /^(f|q|c|w|h|g|e|dpr|ar|r|b|a|o|x|y|z)_/i.test(pathParts[0])
    )
  ) {
    pathParts.shift();
  }

  if (pathParts.length === 0) {
    return url;
  }

  return `${prefix}${pathParts.join('/')}`;
}

function buildCloudinaryVariantUrl(url: string, transformations: string[]) {
  const normalizedUrl = normalizeCloudinaryImageUrl(url);
  const uploadMarker = '/image/upload/';
  const uploadMarkerIndex = normalizedUrl.indexOf(uploadMarker);

  if (!/res\.cloudinary\.com/i.test(normalizedUrl) || uploadMarkerIndex < 0 || transformations.length === 0) {
    return normalizedUrl;
  }

  const prefix = normalizedUrl.slice(0, uploadMarkerIndex + uploadMarker.length);
  const imagePath = normalizedUrl.slice(uploadMarkerIndex + uploadMarker.length).replace(/^\/+/, '');

  return `${prefix}${transformations.join(',')}/${imagePath}`;
}

function resolveLegacyStaticAssetUrl(path: string) {
  const legacyMatch = path.match(/^\/?(Ingredient|Food)\/(.+)$/i);

  if (!legacyMatch) {
    return '';
  }

  const [, folder, fileName] = legacyMatch;
  const cloudinaryFolder = folder.toLowerCase() === 'food' ? 'food' : 'Ingredient';
  return `${CLOUDINARY_IMAGE_BASE_URL}/${cloudinaryFolder}/${fileName}`;
}

export function resolveAssetUrl(url?: string | null) {
  const rawValue = url?.trim();

  if (!rawValue) {
    return '';
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return normalizeCloudinaryImageUrl(rawValue);
  }

  const normalizedPath = rawValue.replace(/^file:\/\//i, '').replace(/\\/g, '/');

  if (/^\/?(Ingredient|Food)\//i.test(normalizedPath)) {
    return resolveLegacyStaticAssetUrl(normalizedPath);
  }

  const staticMarker = '/src/main/resources/static/';
  const staticMarkerIndex = normalizedPath.toLowerCase().indexOf(staticMarker);

  if (staticMarkerIndex >= 0) {
    const publicPath = normalizedPath.slice(staticMarkerIndex + staticMarker.length);
    const cloudinaryStaticUrl = resolveLegacyStaticAssetUrl(publicPath);

    if (cloudinaryStaticUrl) {
      return cloudinaryStaticUrl;
    }

    return `${API_BASE_URL}/${publicPath.replace(/^\/+/, '')}`;
  }

  const knownStaticFolder = normalizedPath.match(/\/(Ingredient|Food)\/.+/i);

  if (knownStaticFolder) {
    return resolveLegacyStaticAssetUrl(knownStaticFolder[0]);
  }

  return `${API_BASE_URL}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
}

export function resolveOptimizedAssetUrl(
  url?: string | null,
  size: 'card' | 'detail' | 'ingredient' | 'avatar' = 'card'
) {
  const resolvedUrl = resolveAssetUrl(url);

  if (!resolvedUrl) {
    return '';
  }

  const transformationsBySize: Record<typeof size, string[]> = {
    card: ['c_fill', 'w_360', 'h_240', 'q_auto:eco', 'f_auto'],
    detail: ['c_fill', 'w_720', 'h_720', 'q_auto:good', 'f_auto'],
    ingredient: ['c_fill', 'w_128', 'h_128', 'q_auto:eco', 'f_auto'],
    avatar: ['c_fill', 'w_320', 'h_320', 'q_auto:good', 'f_auto'],
  };

  return buildCloudinaryVariantUrl(resolvedUrl, transformationsBySize[size]);
}

/* =========================
   REQUEST CORE
========================= */

function shouldRedirectToLogin(status: number) {
  return status === 401 || status === 403 || status === 404 || status >= 500;
}

function openErrorScreen(status: string, message: string) {
  setTimeout(() => {
    router.replace({
      pathname: '/error',
      params: { status, message },
    });
  }, 0);
}

async function redirectToLogin() {
  await clearSelectedProfile();
  await clearAuthSession();

  setTimeout(() => {
    router.replace('/auth/login');
  }, 0);
}

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

  if (shouldRedirectToLogin(response.status)) {
    await redirectToLogin();
  }

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

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchInit,
      headers: buildHeaders(init),
    });
  } catch (error) {
    openErrorScreen('Network', 'Không thể kết nối đến máy chủ. Mẹ kiểm tra mạng hoặc thử lại sau nhé.');
    throw error;
  }

  if (!response.ok) {
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

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchInit,
      method: fetchInit.method ?? 'POST',
      body: formData,
      headers: buildHeaders(init, { jsonContentType: false }),
    });
  } catch (error) {
    openErrorScreen('Network', 'Không thể kết nối đến máy chủ. Mẹ kiểm tra mạng hoặc thử lại sau nhé.');
    throw error;
  }

  if (!response.ok) {
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

export function getVaccineRecordsPageByProfile(
  profileId: number | string,
  params: { status: number; page?: number; size?: number }
) {
  return request<PageResponse<VaccineRecordResponse>>(`/api/vaccine-records/profile/${profileId}/page${buildQueryString({
    status: params.status,
    page: params.page,
    size: params.size,
  })}`, {
    method: 'GET',
  });
}

export function getVaccineStatistics(profileId: number | string) {
  return request<VaccineStatisticsResponse>(`/api/vaccine-records/profile/${profileId}/statistics`, {
    method: 'GET',
  });
}

export function getAiTeachingLessonsByProfile(profileId: number | string) {
  return request<AiTeachingLessonResponse[]>(`/api/ai-teaching/profiles/${profileId}/lessons`, {
    method: 'GET',
  });
}

export function getHandbookPosts(params?: { category?: string; search?: string }) {
  return request<HandbookPostResponse[]>(`/api/handbook/posts${buildQueryString({
    category: params?.category,
    search: params?.search,
  })}`, {
    method: 'GET',
  });
}

export function getHandbookPost(postId: number | string) {
  return request<HandbookPostResponse>(`/api/handbook/posts/${postId}`, {
    method: 'GET',
  });
}

export function getHandbookCategories() {
  return request<string[]>('/api/handbook/categories', {
    method: 'GET',
  });
}

export function getHandbookComments(postId: number | string) {
  return request<HandbookCommentResponse[]>(`/api/handbook/posts/${postId}/comments`, {
    method: 'GET',
  });
}

export function createHandbookComment(postId: number | string, payload: { content: string; parentId?: number | null }) {
  return request<HandbookCommentResponse>(`/api/handbook/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
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

export function getFavoriteFoodIds(profileId: number | string) {
  return request<number[]>(`/api/foods/favorites/profile/${profileId}/ids`, {
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

export function getRestrictedFoodIds(profileId: number | string) {
  return request<number[]>(`/api/foods/restricted/profile/${profileId}/ids`, {
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

/* =========================
   NOTIFICATION API
========================= */

export function getNotifications(params?: { page?: number; size?: number }) {
  return request<PageResponse<AppNotificationResponse>>(`/api/notifications${buildQueryString({
    page: params?.page,
    size: params?.size,
  })}`, {
    method: 'GET',
  });
}

export function getUnreadNotificationCount() {
  return request<{ count: number }>('/api/notifications/unread-count', {
    method: 'GET',
  });
}

export function markNotificationRead(notificationId: number | string) {
  return request<AppNotificationResponse>(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return request<void>('/api/notifications/read-all', {
    method: 'PATCH',
  });
}

export function registerDeviceToken(payload: {
  token: string;
  platform: string;
  deviceId: string;
  appVersion?: string | null;
}) {
  return request<void>('/api/notifications/device-tokens', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deactivateDeviceToken(deviceId: string) {
  return request<void>(`/api/notifications/device-tokens/${encodeURIComponent(deviceId)}`, {
    method: 'DELETE',
  });
}

export function getNotificationSettings() {
  return request<NotificationSettingsResponse>('/api/notifications/settings', {
    method: 'GET',
  });
}

export function updateNotificationSettings(payload: NotificationSettingsPayload) {
  return request<NotificationSettingsResponse>('/api/notifications/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
