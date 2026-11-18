import { Alert, Platform } from 'react-native';

/** Yes/no confirmation that also works in web browsers, where Alert.alert does nothing. */
export function confirmAction(title: string, text: string, action = 'Delete'): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(text));
  return new Promise((resolve) =>
    Alert.alert(title, text, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: action, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}
