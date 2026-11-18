import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Full URL for a backend route such as '/api/contact'.
 * - Web: same origin as the page, so a relative path works locally and on Vercel.
 * - iOS/Android: EXPO_PUBLIC_API_URL (e.g. https://your-app.vercel.app) when set,
 *   otherwise the Expo dev server the app was loaded from.
 */
export function apiUrl(path: string) {
  if (Platform.OS === 'web') return path;
  const base =
    process.env.EXPO_PUBLIC_API_URL ??
    (Constants.expoConfig?.hostUri ? `http://${Constants.expoConfig.hostUri}` : '');
  return `${base.replace(/\/$/, '')}${path}`;
}
