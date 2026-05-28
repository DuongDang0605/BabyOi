import type { ProfileResponse } from './api';
import { getProfilesByUserId } from './api';
import { getAuthSession, hydrateAuthSession } from './auth-session';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-storage';

const SELECTED_PROFILE_STORAGE_KEY = 'babyoi_selected_profile';

let selectedProfile: ProfileResponse | null = null;
let selectedProfileHydrated = false;
let hydrateProfilePromise: Promise<ProfileResponse | null> | null = null;

export async function setSelectedProfile(profile: ProfileResponse | null) {
  selectedProfile = profile;
  selectedProfileHydrated = true;

  if (profile) {
    await setSecureItem(SELECTED_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return;
  }

  await deleteSecureItem(SELECTED_PROFILE_STORAGE_KEY);
}

export async function hydrateSelectedProfile() {
  if (selectedProfileHydrated) {
    return selectedProfile;
  }

  if (hydrateProfilePromise) {
    return hydrateProfilePromise;
  }

  hydrateProfilePromise = hydrateSelectedProfileFromStorage();
  return hydrateProfilePromise;
}

async function hydrateSelectedProfileFromStorage() {
  const rawValue = await getSecureItem(SELECTED_PROFILE_STORAGE_KEY);
  if (!rawValue) {
    selectedProfile = null;
    selectedProfileHydrated = true;
    hydrateProfilePromise = null;
    return null;
  }

  try {
    selectedProfile = JSON.parse(rawValue) as ProfileResponse;
    selectedProfileHydrated = true;
    hydrateProfilePromise = null;
    return selectedProfile;
  } catch {
    selectedProfile = null;
    await deleteSecureItem(SELECTED_PROFILE_STORAGE_KEY);
    selectedProfileHydrated = true;
    hydrateProfilePromise = null;
    return null;
  }
}

export function getSelectedProfile() {
  return selectedProfile;
}

export async function clearSelectedProfile() {
  selectedProfile = null;
  selectedProfileHydrated = true;
  await deleteSecureItem(SELECTED_PROFILE_STORAGE_KEY);
}

export async function ensureCurrentUserSelectedProfile() {
  const currentProfile = selectedProfile || (await hydrateSelectedProfile());
  if (currentProfile) {
    return currentProfile;
  }

  const session = getAuthSession() || (await hydrateAuthSession());
  if (!session?.userId) {
    return null;
  }

  const profiles = await getProfilesByUserId(session.userId);
  const nextProfile =
    profiles.find((profile) => profile.status === 2) ||
    profiles.find((profile) => profile.status === 1) ||
    profiles[0] ||
    null;

  if (nextProfile) {
    await setSelectedProfile(nextProfile);
  }

  return nextProfile;
}
