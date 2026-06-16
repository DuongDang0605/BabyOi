import type { ProfileResponse } from './api';
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
  const profile = selectedProfile ?? await hydrateSelectedProfile();

  if (!profile) {
    throw new Error('Vui lòng chọn hồ sơ trước khi tiếp tục.');
  }

  return profile;
}
