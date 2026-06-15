import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { deactivateDeviceToken, registerDeviceToken } from './api';
import { getSecureItem, setSecureItem } from './secure-storage';

declare const require: any;

const DEVICE_ID_KEY = 'babyoi_device_id';

export async function getDeviceId() {
  const stored = await getSecureItem(DEVICE_ID_KEY);
  if (stored) {
    return stored;
  }

  const generated = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await setSecureItem(DEVICE_ID_KEY, generated);
  return generated;
}

function openNotificationData(data: Record<string, unknown> | undefined) {
  if (!data) return;
  let nestedData: Record<string, unknown> = {};
  if (typeof data.dataJson === 'string') {
    try {
      nestedData = JSON.parse(data.dataJson) as Record<string, unknown>;
    } catch {
      nestedData = {};
    }
  }
  const recordId = nestedData.recordId ?? data.recordId;
  const profileId = nestedData.profileId ?? data.profileId;
  const diseaseId = nestedData.diseaseId ?? data.diseaseId;
  if (recordId && profileId && diseaseId) {
    router.push({
      pathname: '/lichtiem/chitietbenh',
      params: {
        profileId: String(profileId),
        diseaseId: String(diseaseId),
        recordId: String(recordId),
      },
    });
    return;
  }
  if (recordId && profileId) {
    router.push({
      pathname: '/lichtiem/themmuitiem',
      params: {
        profileId: String(profileId),
        mode: 'edit',
        recordId: String(recordId),
      },
    });
    return;
  }
  const route = nestedData.route ?? data.route;
  router.push(typeof route === 'string' && route.startsWith('/') ? route as any : '/notification/notifications');
}

export function configurePushNotificationHandling() {
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') return () => undefined;
  let Notifications: any;
  try {
    Notifications = require('expo-notifications');
  } catch {
    return () => undefined;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
    openNotificationData(response.notification.request.content.data);
  });
  Notifications.getLastNotificationResponseAsync().then((response: any) => {
    if (response) {
      openNotificationData(response.notification.request.content.data);
      Notifications.clearLastNotificationResponseAsync?.();
    }
  });
  return () => responseSubscription.remove();
}

export async function deactivateCurrentDeviceToken() {
  if (Platform.OS === 'web') return;
  try {
    await deactivateDeviceToken(await getDeviceId());
  } catch {
    // Logout must still continue when the device is offline.
  }
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
