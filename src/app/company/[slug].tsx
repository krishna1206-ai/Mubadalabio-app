import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { Reveal, RevealContainer } from '@/components/Reveal';
import { Text } from '@/components/Text';
import { Footer, directionalIcon } from '@/components/ui';
import type { Subsidiary } from '@/constants/content';
import { colors, radius, space } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';

const BANNER = 230;

/** Teal rule that draws itself across the screen when it scrolls into view. */
function Rule() {
  const grow = useRef(new Animated.Value(0)).current;
  return (
    <Reveal
      onVisible={() =>
        Animated.timing(grow, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
      }
      onHidden={() => grow.setValue(0)}
    >
      <Animated.View style={[styles.rule, { transform: [{ scaleX: grow }] }]} />
    </Reveal>
  );
}

function CompanySection({ item }: { item: Subsidiary }) {
  const { isRTL } = useLanguage();
  return (
    <View style={styles.company}>
      <Rule />
      <Reveal from="left">
        <Text style={styles.companyTitle}>{item.name}</Text>
      </Reveal>
      <Rule />

      <Reveal from="scale">
        <Image source={item.logo} style={styles.logo} contentFit="contain" contentPosition={isRTL ? 'right' : 'left'} transition={300} />
      </Reveal>

      {item.paragraphs.map((p, i) => (
        <Reveal key={i} delay={i * 60}>
          <Text style={styles.body}>{p}</Text>
        </Reveal>
      ))}

      {item.highlights.length > 0 && (
        <Reveal from="scale" style={styles.highlights}>
          {item.highlights.map((h, i) => (
            <Reveal key={h} delay={150 + i * 120} from="left" style={styles.hlRow}>
              <Ionicons name="ellipse-outline" size={13} color={colors.teal} style={{ marginTop: 3 }} />
              <Text style={styles.hlText}>{h}</Text>
            </Reveal>
          ))}
        </Reveal>
      )}
    </View>
  );
}

export default function CompanyScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, content, isRTL } = useLanguage();
  const vertical = content.verticals.find((v) => v.slug === slug) ?? content.verticals[0];
  const scrollY = useRef(new Animated.Value(0)).current;

  // Parallax banner: the photo drifts slower than the page and zooms when pulled down.
  const bannerImage = {
    transform: [
      { translateY: scrollY.interpolate({ inputRange: [-BANNER, 0, BANNER], outputRange: [-BANNER / 2, 0, BANNER * 0.4] }) },
      { scale: scrollY.interpolate({ inputRange: [-BANNER, 0], outputRange: [1.8, 1], extrapolateRight: 'clamp' }) },
    ],
  };
  const titleFade = { opacity: scrollY.interpolate({ inputRange: [0, BANNER * 0.6], outputRange: [1, 0], extrapolate: 'clamp' }) };

  return (
    <RevealContainer>
      {(onScroll) => (
        <Animated.ScrollView
          style={styles.screen}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
            listener: onScroll,
          })}
        >
          <View style={[styles.banner, { height: BANNER }]}>
            <Animated.View style={[StyleSheet.absoluteFill, bannerImage]}>
              <Image source={vertical.banner} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
              <LinearGradient
                colors={['rgba(8,40,90,0.75)', 'rgba(8,40,90,0.25)']}
                start={{ x: isRTL ? 1 : 0, y: 0 }}
                end={{ x: isRTL ? 0 : 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <Animated.View style={[styles.bannerContent, titleFade]}>
              <Reveal from="left">
                <Text style={styles.bannerTitle}>{vertical.title}</Text>
              </Reveal>
              <PressableScale onPress={() => router.back()} style={styles.back} scaleTo={0.85} accessibilityLabel={t.goBack}>
                <Ionicons name={directionalIcon('arrow-back', isRTL)} size={26} color={colors.white} />
              </PressableScale>
            </Animated.View>
          </View>

          <View style={styles.content}>
            <Reveal>
              <Text style={styles.intro}>{vertical.summary}</Text>
            </Reveal>
            {vertical.subsidiaries.map((s) => (
              <CompanySection key={s.name} item={s} />
            ))}
          </View>

          <Footer />
        </Animated.ScrollView>
      )}
    </RevealContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  banner: { overflow: 'hidden', backgroundColor: colors.blueDark },
  bannerContent: { flex: 1, padding: space.lg, justifyContent: 'space-between' },
  bannerTitle: { color: colors.white, fontSize: 30, fontWeight: '700' },
  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  content: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xl },
  intro: { color: colors.blue, fontSize: 16, lineHeight: 24 },
  company: { marginTop: space.xl },
  rule: { height: 1.5, backgroundColor: colors.teal },
  companyTitle: { color: colors.teal, fontSize: 19, fontWeight: '700', paddingVertical: 12 },
  logo: { width: 170, height: 64, marginTop: space.lg, marginBottom: space.md },
  body: { color: colors.text, fontSize: 14.5, lineHeight: 22, marginBottom: space.sm },
  highlights: {
    backgroundColor: '#eef9f8',
    borderRadius: radius.sm,
    padding: space.md,
    marginTop: space.md,
    gap: space.md,
  },
  hlRow: { flexDirection: 'row', gap: 10 },
  hlText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21 },
});
