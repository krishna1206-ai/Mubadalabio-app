import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { CountUp } from '@/components/CountUp';
import { HeroBanner } from '@/components/HeroBanner';
import { NewsCard } from '@/components/NewsCard';
import { Reveal, RevealScrollView } from '@/components/Reveal';
import { Text } from '@/components/Text';
import { Button, Footer, Paragraph, SectionTitle } from '@/components/ui';
import { VerticalCard } from '@/components/VerticalCard';
import { VideoCard } from '@/components/VideoCard';
import { media } from '@/constants/content';
import { colors, gradient, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function Home() {
  const { width } = useWindowDimensions();
  const [countStarted, setCountStarted] = useState(false);
  const { t, content, isRTL } = useLanguage();
  const { intro, stats, verticals, articles } = content;

  return (
    <RevealScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroArt}>
          <HeroBanner width={Math.min(width - space.md * 2, 560)} />
        </View>
        <View style={styles.heroText}>
          {t.heroLines.map((line, i) => (
            <Text key={line} style={[type.hero, i === t.heroLines.length - 1 && { fontWeight: '800' }]}>
              {line}
            </Text>
          ))}
        </View>
        <Button title={t.learnMore} onPress={() => router.navigate('/about')} />
      </View>

      {/* Intro */}
      <View style={styles.section}>
        {intro.map((p, i) => (
          <Reveal key={i} delay={i * 120}>
            <Paragraph>{p}</Paragraph>
          </Reveal>
        ))}
        <Reveal>
          <Button title={t.learnMore} variant="outline" onPress={() => router.navigate('/about')} />
        </Reveal>
      </View>

      {/* Video */}
      <Reveal from="scale" style={styles.section}>
        <SectionTitle color={colors.blue}>{t.videoTitle}</SectionTitle>
        <VideoCard poster={media.videoPoster} source={media.video} />
      </Reveal>

      {/* Impact */}
      <Reveal
        onVisible={() => setCountStarted(true)}
        onHidden={() => setCountStarted(false)}
        style={styles.sectionFlush}
      >
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.impact}>
          <Text style={styles.impactTitle}>{t.impactHighlights}</Text>
          <View style={styles.statsGrid}>
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90} from="scale" style={styles.stat}>
                <CountUp
                  prefix={s.prefix}
                  value={s.value}
                  decimals={s.decimals}
                  suffix={s.suffix}
                  start={countStarted}
                  style={[styles.statValue, isRTL && styles.statValueAr]}
                />
                <Text style={styles.statLabel}>{s.label}</Text>
              </Reveal>
            ))}
          </View>
        </LinearGradient>
      </Reveal>

      {/* Companies */}
      <View style={styles.section}>
        <Reveal>
          <SectionTitle>{t.companies}</SectionTitle>
          <Paragraph>{t.companiesIntro}</Paragraph>
        </Reveal>
        {verticals.map((v, i) => (
          <Reveal key={v.slug} delay={i * 120} from={i % 2 ? 'right' : 'left'}>
            <VerticalCard vertical={v} />
          </Reveal>
        ))}
      </View>

      {/* Media */}
      <View style={styles.section}>
        <Reveal style={styles.rowBetween}>
          <SectionTitle>{t.media}</SectionTitle>
          <Button title={t.exploreMore} onPress={() => router.navigate('/media')} style={styles.smallBtn} />
        </Reveal>
        <Reveal>
          <Paragraph>{t.mediaIntro}</Paragraph>
        </Reveal>
        {articles.slice(0, 3).map((a, i) => (
          <Reveal key={a.id} delay={i * 100}>
            <NewsCard article={a} />
          </Reveal>
        ))}
      </View>

      <Footer />
    </RevealScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingTop: space.lg, paddingHorizontal: space.lg, gap: space.lg },
  heroArt: { alignSelf: 'center' },
  heroText: { alignSelf: 'stretch', alignItems: 'center' },
  section: { paddingHorizontal: space.lg, paddingTop: space.xl },
  sectionFlush: { marginTop: space.xl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 16, marginBottom: space.sm },
  impact: { paddingVertical: space.xl, paddingHorizontal: space.md },
  impactTitle: { color: colors.white, fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: space.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.lg },
  stat: { width: '50%', alignItems: 'center', paddingHorizontal: space.sm },
  statValue: { color: colors.white, fontSize: 36, fontWeight: '500', textAlign: 'center' },
  // Arabic figures include words ("إنتاج 2.5 مليار"), so they need a smaller size to fit.
  statValueAr: { fontSize: 22, lineHeight: 32 },
  statLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12, textAlign: 'center', marginTop: 4, lineHeight: 16 },
});
