import type { ProfileResponse } from './api';
import { getProfilesByUserId } from './api';
import { getAuthSession, hydrateAuthSession } from './auth-session';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-storage';

const SELECTED_PROFILE_STORAGE_KEY = 'babyoi_selected_profile';

let selectedProfile: ProfileResponse | null = null;

export async function setSelectedProfile(profile: ProfileResponse | null) {
  selectedProfile = profile;

  if (profile) {
    await setSecureItem(SELECTED_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return;
  }

  await deleteSecureItem(SELECTED_PROFILE_STORAGE_KEY);
}

export async function hydrateSelectedProfile() {
  const rawValue = await getSecureItem(SELECTED_PROFILE_STORAGE_KEY);
  if (!rawValue) {
    selectedProfile = null;
    return null;
  }

  try {
    selectedProfile = JSON.parse(rawValue) as ProfileResponse;
    return selectedProfile;
  } catch {
    selectedProfile = null;
    await deleteSecureItem(SELECTED_PROFILE_STORAGE_KEY);
    return null;
  }
}

export function getSelectedProfile() {
  return selectedProfile;
}

export async function clearSelectedProfile() {
  selectedProfile = null;
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
