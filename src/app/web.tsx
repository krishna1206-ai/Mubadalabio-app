import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Animated, Linking, Pressable, StyleSheet, View } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { colors } from '@/constants/theme';

/** Opens web pages inside the app instead of an external browser. */
export default function WebScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();
  const webRef = useRef<ComponentRef<typeof WebView>>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  const onProgress = (p: number) =>
    Animated.timing(progress, { toValue: p, duration: 150, useNativeDriver: false }).start();

  return (
    <>
      <Stack.Screen
        options={{
          title: title || 'Mubadala Bio',
          headerRight: () => (
            <View style={styles.actions}>
              {canGoBack && (
                <Pressable onPress={() => webRef.current?.goBack()} hitSlop={10}>
                  <Ionicons name="arrow-back-circle-outline" size={26} color={colors.blue} />
                </Pressable>
              )}
              <Pressable onPress={() => webRef.current?.reload()} hitSlop={10}>
                <Ionicons name="refresh" size={22} color={colors.blue} />
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={styles.screen}>
        <WebView
          ref={webRef}
          source={{ uri: url }}
          style={styles.web}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onLoadProgress={({ nativeEvent }) => onProgress(nativeEvent.progress)}
          onNavigationStateChange={(s: WebViewNavigation) => setCanGoBack(s.canGoBack)}
          // Phone, email and app links can't load in a web view, so hand them to the system.
          onShouldStartLoadWithRequest={(req) => {
            if (/^(https?|about|data|blob):/.test(req.url)) return true;
            Linking.openURL(req.url).catch(() => {});
            return false;
          }}
          allowsBackForwardNavigationGestures
          sharedCookiesEnabled
        />
        {loading && (
          <Animated.View
            style={[
              styles.progress,
              { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            ]}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  web: { flex: 1 },
  progress: { position: 'absolute', top: 0, left: 0, height: 3, backgroundColor: colors.teal },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});
