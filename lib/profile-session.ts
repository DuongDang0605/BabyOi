import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ProfileResponse } from './api';

const SELECTED_PROFILE_STORAGE_KEY = 'babyoi_selected_profile';

let selectedProfile: ProfileResponse | null = null;

export async function setSelectedProfile(profile: ProfileResponse | null) {
  selectedProfile = profile;

  if (profile) {
    await AsyncStorage.setItem(SELECTED_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return;
  }

  await AsyncStorage.removeItem(SELECTED_PROFILE_STORAGE_KEY);
}

export async function hydrateSelectedProfile() {
  const rawValue = await AsyncStorage.getItem(SELECTED_PROFILE_STORAGE_KEY);
  if (!rawValue) {
    selectedProfile = null;
    return null;
  }

  try {
    selectedProfile = JSON.parse(rawValue) as ProfileResponse;
    return selectedProfile;
  } catch {
    selectedProfile = null;
    await AsyncStorage.removeItem(SELECTED_PROFILE_STORAGE_KEY);
    return null;
  }
}

export function getSelectedProfile() {
  return selectedProfile;
}

export async function clearSelectedProfile() {
  selectedProfile = null;
  await AsyncStorage.removeItem(SELECTED_PROFILE_STORAGE_KEY);
}
