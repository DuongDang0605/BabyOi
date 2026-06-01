import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { registerDeviceToken } from './api';
import { getSecureItem, setSecureItem } from './secure-storage';

declare const require: any;

const DEVICE_ID_KEY = 'babyoi_device_id';

async function getDeviceId() {
  const stored = await getSecureItem(DEVICE_ID_KEY);
  if (stored) {
    return stored;
  }

  const generated = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await setSecureItem(DEVICE_ID_KEY, generated);
  return generated;
}

export async function registerPushNotifications() {
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') {
    return;
  }

  let Notifications: any;
  try {
    Notifications = require('expo-notifications');
  } catch {
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'BabyOi',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  const permission = currentPermission.status === 'granted'
    ? currentPermission
    : await Notifications.requestPermissionsAsync();

  if (permission.status !== 'granted') {
    return;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  const tokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  await registerDeviceToken({
    token: tokenResponse.data,
    platform: Platform.OS,
    deviceId: await getDeviceId(),
    appVersion: Constants.expoConfig?.version ?? null,
  });
}
