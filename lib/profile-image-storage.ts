import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const PROFILE_IMAGE_FOLDER = 'profile-images';

function getFileExtension(uri: string) {
  const cleanUri = uri.split('?')[0] || uri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();

  if (extension && extension.length <= 5) {
    return extension;
  }

  return 'jpg';
}

function isPersistentOrRemoteUri(uri: string) {
  return uri.startsWith('http://')
    || uri.startsWith('https://')
    || uri.startsWith('data:')
    || uri.includes(`/${PROFILE_IMAGE_FOLDER}/`);
}

export async function persistProfileImage(uri: string) {
  if (!uri || Platform.OS === 'web' || isPersistentOrRemoteUri(uri)) {
    return uri;
  }

  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) {
    return uri;
  }

  const profileImageDirectory = `${documentDirectory}${PROFILE_IMAGE_FOLDER}/`;
  await FileSystem.makeDirectoryAsync(profileImageDirectory, { intermediates: true });

  const fileName = `profile-${Date.now()}-${Math.random().toString(36).slice(2)}.${getFileExtension(uri)}`;
  const targetUri = `${profileImageDirectory}${fileName}`;

  await FileSystem.copyAsync({
    from: uri,
    to: targetUri,
  });

  return targetUri;
}
