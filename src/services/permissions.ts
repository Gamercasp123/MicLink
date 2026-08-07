import { Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS, Permission } from 'react-native-permissions';

const getMicrophonePermission = (): Permission | null => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.MICROPHONE;
  }

  if (Platform.OS === 'android') {
    return PERMISSIONS.ANDROID.RECORD_AUDIO;
  }

  return null;
};

export async function requestMicrophonePermission(): Promise<boolean> {
  const permission = getMicrophonePermission();
  if (!permission) {
    return true;
  }

  const status = await check(permission);
  if (status === RESULTS.GRANTED) {
    return true;
  }

  const result = await request(permission);
  return result === RESULTS.GRANTED;
}
