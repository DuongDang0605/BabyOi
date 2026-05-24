import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getCurrentUser,
  getProfilesByUserId,
  type ProfileResponse,
} from './api';
import { getAuthSession, hydrateAuthSession } from './auth-session';

const SELECTED_PROFILE_STORAGE_KEY = 'babyoi_selected_profile';

let selectedProfile: ProfileResponse | null = null;

export async function setSelectedProfile(profile: ProfileResponse | null) {
  selectedProfile = profile;

  if (profile) {
    await AsyncStorage.setItem(
      SELECTED_PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );
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

export async function ensureCurrentUserSelectedProfile() {
  const session = getAuthSession() || (await hydrateAuthSession());
  const storedProfile = getSelectedProfile() || (await hydrateSelectedProfile());

  if (
    storedProfile &&
    session?.userId &&
    storedProfile.userId === session.userId
  ) {
    return storedProfile;
  }

  if (storedProfile) {
    await clearSelectedProfile();
  }

  let userId = session?.userId;

  if (!userId) {
    try {
      const currentUser = await getCurrentUser();
      userId = currentUser.id;
    } catch {
      return null;
    }
  }

  const profiles = await getProfilesByUserId(userId);
  const firstProfile = profiles[0] ?? null;

  if (firstProfile) {
    await setSelectedProfile(firstProfile);
  }

  return firstProfile;
}