import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Text } from './Text';

function PlayerModal({ source, onClose }: { source: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(source, (p) => p.play());
  return (
    <View style={styles.modal}>
      <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />
      <Pressable onPress={onClose} style={[styles.close, { top: insets.top + 12 }]} hitSlop={12}>
        <Ionicons name="close" size={26} color={colors.white} />
      </Pressable>
    </View>
  );
}

/** Poster with a pulsing play button that opens the company video full screen. */
export function VideoCard({ poster, source }: { poster: string; source: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.card}>
        <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
        <View style={styles.tint} />
        <View style={styles.playWrap}>
          <Animated.View
            style={[
              styles.ripple,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
              },
            ]}
          />
          <View style={styles.play}>
            <Ionicons name="play" size={30} color={colors.blue} style={{ marginLeft: 4 }} />
          </View>
        </View>
        <Text style={styles.watch}>{t.watchNow}</Text>
      </Pressable>
      <Modal visible={open} animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        {open && <PlayerModal source={source} onClose={() => setOpen(false)} />}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 210,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
  },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(28,128,250,0.25)' },
  playWrap: { alignItems: 'center', justifyContent: 'center' },
  ripple: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: colors.white },
  play: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watch: { color: colors.white, fontWeight: '600', marginTop: 14, fontSize: 15 },
  modal: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  video: { width: '100%', aspectRatio: 16 / 9 },
  close: { position: 'absolute', right: 16, padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
});
