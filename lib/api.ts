import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
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
  manufacturer?: string | null;
  origin?: string | null;
};

export type VaccineRecordRequest = {
  profileId: number;
  diseaseId?: number;
  doseOrder?: number;
  source?: number;
  vaccineTypeId?: number | null;
  injectionDate?: string | null;
  location?: string;
  actualInjectionDate?: string;
  note?: string;
  price?: number;
  status: number;
};

export type VaccineRecordResponse = {
  id: number;
  profileId: number;
  diseaseId: number | null;
  doseOrder: number | null;
  source: number | null;
  sourceCode: string | null;
  vaccineTypeId: number;
  vaccineTypeName: string;
  vaccineTypeDescription: string | null;
  injectionDate: string;
  location: string | null;
  actualInjectionDate?: string | null;
  price: number | null;
  note: string | null;
  status: number | null;
};

type VaccineCatalogResponse = {
  id: number;
  name: string;
  manufacturer: string | null;
  origin: string | null;
  description: string | null;
  status: number | null;
};

type VaccineRecordApiRequest = {
  profileId: number;
  diseaseId?: number;
  doseOrder?: number;
  source?: number;
  vaccineId?: number | null;
  injectionDate?: string | null;
  actualInjectionDate?: string;
  price?: number;
  note?: string;
  status: number;
};

type VaccineRecordApiResponse = {
  id: number;
  profileId: number;
  locationName: string | null;
  diseaseId: number | null;
  doseOrder: number | null;
  source: number | null;
  sourceCode: string | null;
  vaccineId: number | null;
  vaccineName: string | null;
  vaccineDescription: string | null;
  injectionDate: string;
  actualInjectionDate: string | null;
  price: number | null;
  note: string | null;
  status: number | null;
};

export type VaccineStatisticsResponse = {
  pending: number;
  canceled: number;
  success: number;
};

export type VaccineProgressDoseResponse = {
  recordId: number | null;
  doseOrder: number | null;
  source: number | null;
  sourceCode: string | null;
  vaccineId: number | null;
  vaccineName: string | null;
  manufacturer: string | null;
  injectionDate: string | null;
  actualInjectionDate: string | null;
  status: number | null;
  note: string | null;
};

export type ChildVaccineDiseaseResponse = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  required: boolean | null;
  displayOrder: number | null;
  status: number | null;
};

export type VaccineDiseaseCoverageResponse = {
  id: number;
  vaccineId: number | null;
  vaccineName: string | null;
  manufacturer: string | null;
  diseaseId: number | null;
  diseaseCode: string | null;
  diseaseName: string | null;
  productFamilyCode: string | null;
  interchangeRule: number | null;
  interchangeRuleCode: string | null;
  status: number | null;
};

export type ChildDiseaseDoseScheduleResponse = {
  id: number;
  diseaseId: number | null;
  diseaseCode: string | null;
  diseaseName: string | null;
  doseOrder: number | null;
  recommendedAgeMonths: number | null;
  intervalDays: number | null;
  doseLabel: string | null;
  note: string | null;
  status: number | null;
};

export type ChildDiseaseDoseVaccineOptionResponse = {
  id: number;
  diseaseId: number | null;
  doseOrder: number | null;
  vaccineId: number | null;
  vaccineName: string | null;
  manufacturer: string | null;
  origin: string | null;
  description: string | null;
  preferred: boolean | null;
  displayOrder: number | null;
  note: string | null;
  status: number | null;
};

export type ChildDiseaseDosePlanResponse = {
  schedule: ChildDiseaseDoseScheduleResponse;
  vaccineOptions: ChildDiseaseDoseVaccineOptionResponse[];
};

export type ChildDiseasePlanResponse = {
  disease: ChildVaccineDiseaseResponse;
  doses: ChildDiseaseDosePlanResponse[];
  coverages: VaccineDiseaseCoverageResponse[];
};

export type VaccineProgressResponse = {
  diseaseId: number | null;
  diseaseCode: string | null;
  diseaseName: string | null;
  totalDoses: number | null;
  completedDoses: number | null;
  pendingDoses: number | null;
  currentDoseOrder: number | null;
  nextDoseOrder: number | null;
  nextInjectionDate: string | null;
  stopped: boolean | null;
  diseaseScheduleStatus: number | null;
  stoppedAt: string | null;
  stoppedDoseOrder: number | null;
  interchangeRule: number | null;
  interchangeRuleCode: string | null;
  productFamilyCodes: string[] | null;
  warnings: string[] | null;
  doses: VaccineProgressDoseResponse[] | null;
};

export type HealthRecordPayload = {
  profileId: number;
  height?: number | null;
  weight?: number | null;
  heartRate?: number | null;
  bmi?: number | null;
  recordDate: string;
};

export type HealthRecordResponse = {
  id: number;
  profileId: number;
  height: number | null;
  weight: number | null;
  heartRate: number | null;
  bmi: number | null;
  illnessCount: number | null;
  recordDate: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type IllnessEventPayload = {
  profileId: number;
  startAt: string;
  endAt?: string | null;
  illnessType: string;
  status?: number | null;
  description?: string | null;
};

export type IllnessEventResponse = {
  id: number;
  profileId: number;
  startAt: string;
  endAt: string | null;
  illnessType: string;
  status: number | null;
  statusLabel: string | null;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type HealthMonthlyDetailResponse = {
  healthRecord: HealthRecordResponse | null;
  illnesses: IllnessEventResponse[];
};

export type HealthFilterParams = {
  fromDate?: string;
  toDate?: string;
  month?: number;
  year?: number;
  status?: number;
};

export type DiaryEntryPayload = {
  profileId: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  milestone?: string | null;
  entryDate: string;
};

export type DiaryEntryResponse = {
  id: number;
  profileId: number;
  title: string;
  content: string;
  imageUrl: string | null;
  milestone: string | null;
  entryDate: string;
  status: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type DiaryFilterParams = {
  fromDate?: string;
  toDate?: string;
  search?: string;
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

export type DetectedIngredientResponse = {
  name: string;
  confidence: number | null;
};

export type MatchedFoodIngredientResponse = {
  detectedName: string | null;
  confidence: number | null;
  ingredientId: number | null;
  ingredientName: string | null;
  imageUrl: string | null;
  nutrition: IngredientNutritionResponse | null;
};

export type IngredientFoodSuggestionItemResponse = {
  food: FoodResponse;
  matchScore: number | null;
  matchedIngredients: string[] | null;
  missingIngredients: string[] | null;
  suitabilityNote: string | null;
  nutritionNote: string | null;
};

export type IngredientFoodSuggestionResponse = {
  profileId: number | null;
  profileName: string | null;
  profileAgeMonths: number | null;
  imageAnalyzed: boolean | null;
  detectedIngredients: DetectedIngredientResponse[] | null;
  matchedDbIngredients: MatchedFoodIngredientResponse[] | null;
  inputIngredients: string[] | null;
  normalizedIngredients: string[] | null;
  suggestions: IngredientFoodSuggestionItemResponse[] | null;
  warnings: string[] | null;
  disclaimer: string | null;
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
  archivedAt: string | null;
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

export type BabyRoutineEntryResponse = {
  id: number;
  profileId: number;
  routineDate: string;
  type: string;
  time: string;
  actualTime: string | null;
  activity: string;
  note: string | null;
  icon: string | null;
  color: string | null;
  completed: boolean;
  source: string | null;
};

export type BabyRoutineAiAnalysisResponse = {
  title: string;
  summary: string;
  recommendedTomorrowWakeTime: string | null;
  highlights: string[] | null;
  warnings: string[] | null;
  suggestions: string[] | null;
  disclaimer: string | null;
};

export type BabyRoutineNightEventPredictionResponse = {
  type: string;
  label: string;
  earliestDateTime: string;
  likelyDateTime: string;
  latestDateTime: string;
  note: string;
};

export type BabyRoutineSleepPredictionResponse = {
  sleepType: string;
  sleepStartDateTime: string;
  earliestWakeDateTime: string;
  likelyWakeDateTime: string;
  latestWakeDateTime: string;
  expectedSleepMinutesMin: number;
  expectedSleepMinutesLikely: number;
  expectedSleepMinutesMax: number;
  minutesUntilLikelyWake: number | null;
  nightEvents: BabyRoutineNightEventPredictionResponse[] | null;
  explanation: string;
};

export type BabyRoutineDayResponse = {
  profileId: number;
  profileName: string;
  profileAgeMonths: number;
  routineDate: string;
  ageGroup: string;
  sleepTargetMinHours: number;
  sleepTargetMaxHours: number;
  feedingGuide: string;
  activityGuide: string;
  sleepPrediction: BabyRoutineSleepPredictionResponse | null;
  entries: BabyRoutineEntryResponse[];
  aiInsight: BabyRoutineAiAnalysisResponse | null;
};

export type BabyRoutineHistoryResponse = {
  profileId: number;
  profileName: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  days: BabyRoutineDayResponse[];
};

export type BabyRoutineEntryUpdatePayload = {
  completed: boolean;
  actualTime?: string | null;
  note?: string | null;
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
  silent?: boolean;
  fallbackTimeoutMs?: number | null;
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

const DEFAULT_PUBLIC_API_BASE_URL = 'http://187.77.130.63:8085';
const LOCAL_API_PORT = 8085;
const API_FALLBACK_TIMEOUT_MS = 2500;

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/$/, '');
}

function uniqueUrls(urls: string[]) {
  return Array.from(new Set(urls.map(normalizeBaseUrl).filter(Boolean)));
}

function getHostFromUri(uri?: string | null) {
  if (typeof uri !== 'string' || !uri.trim()) {
    return null;
  }

  const normalizedUri = /^[a-z][a-z\d+\-.]*:\/\//i.test(uri) ? uri : `http://${uri}`;

  try {
    return new URL(normalizedUri).hostname;
  } catch {
    return uri.split(':')[0] || null;
  }
}

function getConfiguredBaseUrl() {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const configuredBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;

  if (typeof envBaseUrl === 'string' && envBaseUrl.trim()) {
    return normalizeBaseUrl(envBaseUrl);
  }

  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.trim()) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  return '';
}

function getLocalBaseUrlCandidates() {
  const inferredHost = getHostFromUri(Constants.expoConfig?.hostUri);
  const candidates: string[] = [];

  if (Platform.OS === 'android') {
    candidates.push(`http://10.0.2.2:${LOCAL_API_PORT}`);
  }

  if (inferredHost) {
    candidates.push(`http://${inferredHost}:${LOCAL_API_PORT}`);
  }

  if (Platform.OS !== 'android') {
    candidates.push(`http://localhost:${LOCAL_API_PORT}`);
  }

  return uniqueUrls(candidates);
}

function getApiBaseUrlCandidates() {
  const configuredBaseUrl = getConfiguredBaseUrl();

  if (configuredBaseUrl) {
    return [configuredBaseUrl];
  }

  if (!__DEV__) {
    return [DEFAULT_PUBLIC_API_BASE_URL];
  }

  return uniqueUrls([...getLocalBaseUrlCandidates(), DEFAULT_PUBLIC_API_BASE_URL]);
}

export const API_BASE_URLS = getApiBaseUrlCandidates();
export const API_BASE_URL = API_BASE_URLS[0];

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
  size: 'card' | 'detail' | 'cooking' | 'ingredient' | 'avatar' = 'card'
) {
  const resolvedUrl = resolveAssetUrl(url);

  if (!resolvedUrl) {
    return '';
  }

  const transformationsBySize: Record<typeof size, string[]> = {
    card: ['c_fill', 'w_180', 'h_120', 'q_auto:low', 'f_auto'],
    detail: ['c_fill', 'w_260', 'h_260', 'q_auto:low', 'f_auto'],
    cooking: ['c_fill', 'w_520', 'h_360', 'q_auto:low', 'f_auto'],
    ingredient: ['c_fill', 'w_96', 'h_96', 'dpr_auto', 'q_auto:low', 'f_auto'],
    avatar: ['c_fill', 'w_240', 'h_240', 'dpr_auto', 'q_auto:eco', 'f_auto'],
  };

  return buildCloudinaryVariantUrl(resolvedUrl, transformationsBySize[size]);
}

/* =========================
   REQUEST CORE
========================= */

function shouldRedirectToLogin(status: number) {
  return status === 401 || status === 403;
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
  const { clearSelectedProfile } = await import('./profile-session');

  await clearSelectedProfile();
  await clearAuthSession();

  setTimeout(() => {
    router.replace('/auth/login');
  }, 0);
}

async function parseError(response: Response, init?: ApiRequestInit): Promise<never> {
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
  } else if (response.status >= 500 && !init?.silent) {
    openErrorScreen(payload?.status || String(response.status), message);
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

function createRequestSignal(sourceSignal?: AbortSignal | null, timeoutMs?: number) {
  const controller = new AbortController();
  const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
  const abort = () => controller.abort();

  if (sourceSignal?.aborted) {
    controller.abort();
  } else {
    sourceSignal?.addEventListener('abort', abort, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timer) {
        clearTimeout(timer);
      }
      sourceSignal?.removeEventListener('abort', abort);
    },
  };
}

async function fetchWithApiFallback(
  path: string,
  fetchInit: RequestInit,
  init?: ApiRequestInit,
  options?: { jsonContentType?: boolean }
) {
  let lastError: unknown;

  for (const [index, baseUrl] of API_BASE_URLS.entries()) {
    const timeoutMs = index < API_BASE_URLS.length - 1
      ? init?.fallbackTimeoutMs === null
        ? undefined
        : init?.fallbackTimeoutMs ?? API_FALLBACK_TIMEOUT_MS
      : undefined;
    const { signal, cleanup } = createRequestSignal(fetchInit.signal, timeoutMs);

    try {
      return await fetch(`${baseUrl}${path}`, {
        ...fetchInit,
        signal,
        headers: buildHeaders(init, options),
      });
    } catch (error) {
      lastError = error;
    } finally {
      cleanup();
    }
  }

  throw lastError;
}

async function request<T>(path: string, init?: ApiRequestInit): Promise<T> {
  await hydrateAuthSession();

  const { skipAuth, silent, fallbackTimeoutMs, ...fetchInit } = init ?? {};

  let response: Response;

  try {
    response = await fetchWithApiFallback(path, fetchInit, init);
  } catch (error) {
    if (!silent) {
      openErrorScreen('Network', 'Không thể kết nối đến máy chủ. Mẹ kiểm tra mạng hoặc thử lại sau nhé.');
    }
    throw error;
  }

  if (!response.ok) {
    await parseError(response, init);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function requestMultipart<T>(path: string, formData: FormData, init?: ApiRequestInit): Promise<T> {
  await hydrateAuthSession();

  const { skipAuth, silent, fallbackTimeoutMs, ...fetchInit } = init ?? {};

  let response: Response;

  try {
    response = await fetchWithApiFallback(
      path,
      {
        ...fetchInit,
        method: fetchInit.method ?? 'POST',
        body: formData,
      },
      init,
      { jsonContentType: false }
    );
  } catch (error) {
    if (!silent) {
      openErrorScreen('Network', 'Không thể kết nối đến máy chủ. Mẹ kiểm tra mạng hoặc thử lại sau nhé.');
    }
    throw error;
  }

  if (!response.ok) {
    await parseError(response, init);
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

export function deleteCurrentAccount() {
  return request<void>('/api/users/me', {
    method: 'DELETE',
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

function getDiaryUploadFileName(uri: string) {
  const cleanUri = uri.split('?')[0] || uri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();
  const safeExtension = extension && extension.length <= 5 ? extension : 'jpg';
  return `diary-image-${Date.now()}.${safeExtension}`;
}

function getIngredientUploadFileName(uri: string) {
  const cleanUri = uri.split('?')[0] || uri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();
  const safeExtension = extension && extension.length <= 5 ? extension : 'jpg';
  return `ingredient-photo-${Date.now()}.${safeExtension}`;
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

async function appendImageToFormData(formData: FormData, fieldName: string, uri: string, fileName: string) {
  const mimeType = getUploadMimeType(uri);

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append(fieldName, blob, fileName);
    return;
  }

  formData.append(fieldName, {
    uri,
    name: fileName,
    type: mimeType,
  } as any);
}

async function readImageBase64(uri: string) {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function uploadProfileAvatar(uri: string) {
  const formData = new FormData();
  await appendImageToFormData(formData, 'file', uri, getUploadFileName(uri));

  const response = await requestMultipart<ProfileAvatarUploadResponse>('/api/profiles/avatar', formData);
  return response.imageUrl;
}

export async function uploadDiaryImage(uri: string) {
  const formData = new FormData();
  await appendImageToFormData(formData, 'file', uri, getDiaryUploadFileName(uri));

  const response = await requestMultipart<ProfileAvatarUploadResponse>('/api/diary-entries/image', formData);
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

function mapVaccineCatalogToType(item: VaccineCatalogResponse): VaccineTypeResponse {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    requiredAge: null,
    manufacturer: item.manufacturer,
    origin: item.origin,
  };
}

function extractManualLocation(note?: string | null) {
  const match = note?.match(/Địa điểm nhập tay:\s*([^-]+)/);
  return match?.[1]?.trim() || null;
}

function removeManualLocationFromNote(note?: string | null) {
  return note?.replace(/\s*-\s*Địa điểm nhập tay:\s*[^-]+/, '').trim() || null;
}

function mapVaccineRecordResponse(item: VaccineRecordApiResponse): VaccineRecordResponse {
  return {
    id: item.id,
    profileId: item.profileId,
    diseaseId: item.diseaseId,
    doseOrder: item.doseOrder,
    source: item.source,
    sourceCode: item.sourceCode,
    vaccineTypeId: item.vaccineId ?? 0,
    vaccineTypeName: item.vaccineName ?? 'Vắc-xin chưa cập nhật',
    vaccineTypeDescription: item.vaccineDescription,
    injectionDate: item.injectionDate,
    location: item.locationName ?? extractManualLocation(item.note),
    actualInjectionDate: item.actualInjectionDate,
    price: item.price,
    note: removeManualLocationFromNote(item.note),
    status: item.status,
  };
}

function mapVaccineRecordRequest(payload: VaccineRecordRequest): VaccineRecordApiRequest {
  return {
    profileId: payload.profileId,
    diseaseId: payload.diseaseId,
    doseOrder: payload.doseOrder,
    source: payload.source,
    vaccineId: payload.vaccineTypeId ?? null,
    injectionDate: payload.injectionDate,
    actualInjectionDate: payload.actualInjectionDate,
    price: payload.price,
    note: payload.location
      ? [payload.note, `Địa điểm nhập tay: ${payload.location}`].filter(Boolean).join(' - ')
      : payload.note,
    status: payload.status,
  };
}

export function getVaccineTypes(keyword?: string) {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';

  return request<VaccineCatalogResponse[]>(`/api/vaccine-catalog/vaccines${query}`, {
    method: 'GET',
  }).then((items) => items.map(mapVaccineCatalogToType));
}

export function getChildVaccineDiseases() {
  return request<ChildVaccineDiseaseResponse[]>('/api/vaccine-catalog/child-diseases', {
    method: 'GET',
  });
}

export function getChildDiseasePlan(diseaseId: number | string) {
  return request<ChildDiseasePlanResponse>(`/api/vaccine-catalog/child-diseases/${diseaseId}/plan`, {
    method: 'GET',
  });
}

export function getChildDiseaseDoseVaccineOptions(diseaseId: number | string) {
  return request<ChildDiseaseDoseVaccineOptionResponse[]>(`/api/vaccine-catalog/child-diseases/${diseaseId}/dose-vaccine-options`, {
    method: 'GET',
  });
}

export function createVaccineRecord(payload: VaccineRecordRequest) {
  return request<VaccineRecordApiResponse>('/api/vaccine-records', {
    method: 'POST',
    body: JSON.stringify(mapVaccineRecordRequest(payload)),
  }).then(mapVaccineRecordResponse);
}

export function updateVaccineRecord(recordId: number | string, payload: VaccineRecordRequest) {
  return request<VaccineRecordApiResponse>(`/api/vaccine-records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(mapVaccineRecordRequest(payload)),
  }).then(mapVaccineRecordResponse);
}

export function getVaccineRecord(recordId: number | string) {
  return request<VaccineRecordApiResponse>(`/api/vaccine-records/${recordId}`, {
    method: 'GET',
  }).then(mapVaccineRecordResponse);
}

export function deleteVaccineRecord(recordId: number | string) {
  return request<void>(`/api/vaccine-records/${recordId}`, {
    method: 'DELETE',
  });
}

export function getVaccineStatistics(profileId: number | string, init?: ApiRequestInit) {
  return request<VaccineStatisticsResponse>(`/api/vaccine-records/profile/${profileId}/statistics`, {
    ...init,
    method: 'GET',
  });
}

export function getVaccineProgress(profileId: number | string, init?: ApiRequestInit) {
  return request<VaccineProgressResponse[]>(`/api/vaccine-catalog/profiles/${profileId}/progress`, {
    ...init,
    method: 'GET',
  });
}

export function stopProfileDiseaseSchedule(profileId: number | string, diseaseId: number | string) {
  return request<VaccineProgressResponse>(`/api/vaccine-catalog/profiles/${profileId}/child-diseases/${diseaseId}/stop`, {
    silent: true,
    method: 'PATCH',
  });
}

export function resumeProfileDiseaseSchedule(profileId: number | string, diseaseId: number | string) {
  return request<VaccineProgressResponse>(`/api/vaccine-catalog/profiles/${profileId}/child-diseases/${diseaseId}/resume`, {
    silent: true,
    method: 'PATCH',
  });
}

/* =========================
   HEALTH TRACKING API
========================= */

export function getHealthRecords(profileId: number | string, params?: HealthFilterParams) {
  return request<HealthRecordResponse[]>(`/api/health-records/profile/${profileId}${buildQueryString({
    fromDate: params?.fromDate,
    toDate: params?.toDate,
    month: params?.month,
    year: params?.year,
  })}`, {
    method: 'GET',
  });
}

export function getHealthRecord(recordId: number | string) {
  return request<HealthRecordResponse>(`/api/health-records/${recordId}`, {
    method: 'GET',
  });
}

export function createHealthRecord(payload: HealthRecordPayload) {
  return request<HealthRecordResponse>('/api/health-records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateHealthRecord(recordId: number | string, payload: HealthRecordPayload) {
  return request<HealthRecordResponse>(`/api/health-records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteHealthRecord(recordId: number | string) {
  return request<void>(`/api/health-records/${recordId}`, {
    method: 'DELETE',
  });
}

export function getHealthMonthlyDetail(profileId: number | string, params?: { month?: number; year?: number }) {
  return request<HealthMonthlyDetailResponse>(`/api/health-records/profile/${profileId}/monthly-detail${buildQueryString({
    month: params?.month,
    year: params?.year,
  })}`, {
    method: 'GET',
  });
}

export function getIllnessEvents(profileId: number | string, params?: HealthFilterParams) {
  return request<IllnessEventResponse[]>(`/api/illness-events/profile/${profileId}${buildQueryString({
    fromDate: params?.fromDate,
    toDate: params?.toDate,
    month: params?.month,
    year: params?.year,
    status: params?.status,
  })}`, {
    method: 'GET',
  });
}

export function getIllnessEvent(eventId: number | string) {
  return request<IllnessEventResponse>(`/api/illness-events/${eventId}`, {
    method: 'GET',
  });
}

export function createIllnessEvent(payload: IllnessEventPayload) {
  return request<IllnessEventResponse>('/api/illness-events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateIllnessEvent(eventId: number | string, payload: IllnessEventPayload) {
  return request<IllnessEventResponse>(`/api/illness-events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteIllnessEvent(eventId: number | string) {
  return request<void>(`/api/illness-events/${eventId}`, {
    method: 'DELETE',
  });
}

/* =========================
   BABY ROUTINE API
========================= */

export function getBabyRoutineDay(profileId: number | string, date?: string) {
  return request<BabyRoutineDayResponse>(`/api/routines/profile/${profileId}${buildQueryString({ date })}`, {
    method: 'GET',
  });
}

export function getBabyRoutineHistory(profileId: number | string, params: { fromDate: string; toDate: string }) {
  return request<BabyRoutineHistoryResponse>(`/api/routines/profile/${profileId}/history${buildQueryString(params)}`, {
    method: 'GET',
  });
}

export function applyBabyRoutineNextDayAdjustment(profileId: number | string, date?: string) {
  return request<BabyRoutineDayResponse>(`/api/routines/profile/${profileId}/next-day-adjustment${buildQueryString({ date })}`, {
    method: 'POST',
  });
}

export function updateBabyRoutineEntryCompletion(entryId: number | string, payload: BabyRoutineEntryUpdatePayload) {
  return request<BabyRoutineEntryResponse>(`/api/routines/entries/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function updateBabyRoutineTimeline(entryId: number | string) {
  return request<BabyRoutineDayResponse>(`/api/routines/entries/${entryId}/timeline-update`, {
    method: 'POST',
  });
}

export function analyzeBabyRoutine(profileId: number | string, date?: string) {
  return request<BabyRoutineAiAnalysisResponse>(`/api/routines/profile/${profileId}/ai-analysis${buildQueryString({ date })}`, {
    method: 'POST',
    fallbackTimeoutMs: 30000,
  });
}

/* =========================
   DIARY API
========================= */

export function getDiaryEntries(profileId: number | string, params?: DiaryFilterParams) {
  return request<DiaryEntryResponse[]>(`/api/diary-entries/profile/${profileId}${buildQueryString({
    fromDate: params?.fromDate,
    toDate: params?.toDate,
    search: params?.search,
  })}`, {
    method: 'GET',
  });
}

export function getDiaryEntry(entryId: number | string) {
  return request<DiaryEntryResponse>(`/api/diary-entries/${entryId}`, {
    method: 'GET',
  });
}

export function createDiaryEntry(payload: DiaryEntryPayload) {
  return request<DiaryEntryResponse>('/api/diary-entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateDiaryEntry(entryId: number | string, payload: DiaryEntryPayload) {
  return request<DiaryEntryResponse>(`/api/diary-entries/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteDiaryEntry(entryId: number | string) {
  return request<void>(`/api/diary-entries/${entryId}`, {
    method: 'DELETE',
  });
}

export function getAiTeachingLessonsByProfile(profileId: number | string, init?: ApiRequestInit) {
  return request<AiTeachingLessonResponse[]>(`/api/ai-teaching/profiles/${profileId}/lessons`, {
    ...init,
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

export async function suggestFoodsFromIngredients(params: {
  profileId?: number | string | null;
  ingredientNames?: string[];
  imageUri?: string | null;
  limit?: number;
}) {
  const ingredientNames = params.ingredientNames
    ?.map((name) => name.trim())
    .filter(Boolean);
  const imageBase64 = params.imageUri ? await readImageBase64(params.imageUri) : null;

  return request<IngredientFoodSuggestionResponse>('/api/foods/suggestions/from-ingredients-json', {
    method: 'POST',
    fallbackTimeoutMs: 90000,
    body: JSON.stringify({
      profileId: params.profileId != null ? Number(params.profileId) : null,
      ingredientNames,
      imageBase64,
      imageMimeType: params.imageUri ? getUploadMimeType(params.imageUri) : null,
      imageFilename: params.imageUri ? getIngredientUploadFileName(params.imageUri) : null,
      limit: params.limit ?? 6,
    }),
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

export function getNotifications(params?: { page?: number; size?: number; archived?: boolean }) {
  return request<PageResponse<AppNotificationResponse>>(`/api/notifications${buildQueryString({
    page: params?.page,
    size: params?.size,
    archived: params?.archived === undefined ? undefined : String(params.archived),
  })}`, {
    silent: true,
    method: 'GET',
  });
}

export function getUnreadNotificationCount() {
  return request<{ count: number }>('/api/notifications/unread-count', {
    silent: true,
    method: 'GET',
  });
}

export function markNotificationRead(notificationId: number | string) {
  return request<AppNotificationResponse>(`/api/notifications/${notificationId}/read`, {
    silent: true,
    method: 'PATCH',
  });
}

export function archiveNotification(notificationId: number | string) {
  return request<void>(`/api/notifications/${notificationId}/archive`, {
    silent: true,
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return request<void>('/api/notifications/read-all', {
    silent: true,
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
    silent: true,
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
