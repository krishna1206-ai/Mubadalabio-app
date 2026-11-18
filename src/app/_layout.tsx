import { LocaleProvider, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { TopBar } from '@/components/ui';
import { colors } from '@/constants/theme';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageProvider';

function RootStack() {
  const { isRTL, t } = useLanguage();
  const direction = isRTL ? 'rtl' : 'ltr';

  return (
    // LocaleProvider flips navigation headers, transitions and gestures; the View flips app content.
    <LocaleProvider direction={direction}>
      <View style={{ flex: 1, direction }}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTintColor: colors.blue,
            headerTitleStyle: { color: colors.ink },
            headerBackButtonDisplayMode: 'minimal',
            animation: isRTL ? 'slide_from_left' : 'slide_from_right',
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="company/[slug]" options={{ header: () => <TopBar /> }} />
          <Stack.Screen name="news/[id]" options={{ title: t.pressRelease }} />
          <Stack.Screen name="leadership" options={{ title: t.ourLeadership }} />
          <Stack.Screen name="web" options={{ title: '' }} />
          <Stack.Screen name="admin" options={{ headerShown: false, title: 'Admin' }} />
        </Stack>
      </View>
    </LocaleProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <RootStack />
    </LanguageProvider>
  );
}
