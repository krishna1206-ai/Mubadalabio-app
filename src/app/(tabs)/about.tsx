import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { Reveal, RevealScrollView } from '@/components/Reveal';
import { Text } from '@/components/Text';
import { Footer, PageHeader, Paragraph, SectionTitle, directionalIcon, openLink } from '@/components/ui';
import { VideoCard } from '@/components/VideoCard';
import { media } from '@/constants/content';
import { card, colors, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function About() {
  const { t, content, isRTL } = useLanguage();
  const { about } = content;
  return (
    <RevealScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <PageHeader title={t.aboutMubadalaBio} subtitle={t.purposeTagline} />

      <View style={styles.section}>
        {about.paragraphs.map((p, i) => (
          <Reveal key={i} delay={i * 100}>
            <Paragraph>{p}</Paragraph>
          </Reveal>
        ))}
        <Reveal from="scale">
          <VideoCard poster={media.heroImage} source={media.video} />
        </Reveal>
      </View>

      <View style={styles.section}>
        <Reveal from="left" style={[styles.purpose, { borderStartColor: colors.blue }]}>
          <Text style={styles.label}>{t.ourPurpose}</Text>
          <Text style={[type.h1, { color: colors.blue }]}>{t.purposeTagline}</Text>
        </Reveal>
        <Reveal from="right" style={[styles.purpose, { borderStartColor: colors.teal }]}>
          <Text style={styles.label}>{t.ourAspiration}</Text>
          <Text style={type.body}>{about.aspiration}</Text>
        </Reveal>
      </View>

      <View style={styles.section}>
        <Reveal>
          <SectionTitle>{t.ourValues}</SectionTitle>
        </Reveal>
        <View style={styles.grid}>
          {about.values.map((v, i) => (
            <Reveal key={v.title} delay={i * 100} from="scale" style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: i % 2 ? colors.teal : colors.blue }]}>
                <Ionicons name={v.icon} size={22} color={colors.white} />
              </View>
              <Text style={type.h3}>{v.title}</Text>
              <Text style={[type.small, { color: colors.text, marginTop: 4 }]}>{v.text}</Text>
            </Reveal>
          ))}
        </View>
      </View>

      <View style={[styles.section, { paddingBottom: space.xl }]}>
        <Reveal>
          <SectionTitle>{t.whoWeAre}</SectionTitle>
        </Reveal>
        {[
          { title: t.boardOfDirectors, onPress: () => router.push('/leadership') },
          { title: t.leadershipTeam, onPress: () => router.push({ pathname: '/leadership', params: { section: 'team' } }) },
          { title: t.aboutMubadala, onPress: () => openLink(about.aboutMubadalaUrl, t.aboutMubadala) },
          { title: t.careers, onPress: () => router.push('/careers') },
        ].map((l, i) => (
          <Reveal key={l.title} delay={i * 80} from="right">
            <PressableScale onPress={l.onPress} style={styles.linkRow} scaleTo={0.98}>
              <Text style={styles.linkText}>{l.title}</Text>
              <Ionicons name={directionalIcon('chevron-forward', isRTL)} size={18} color={colors.blue} />
            </PressableScale>
          </Reveal>
        ))}
      </View>

      <Footer />
    </RevealScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: space.lg, paddingTop: space.xl },
  purpose: { borderStartWidth: 4, paddingStart: space.md, marginBottom: space.lg },
  label: { color: colors.teal, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.md },
  valueCard: { ...card, width: '48%', padding: space.md },
  valueIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  linkRow: {
    ...card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: space.md,
    marginBottom: space.sm,
  },
  linkText: { fontSize: 16, color: colors.ink, fontWeight: '500' },
});
