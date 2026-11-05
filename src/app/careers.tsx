import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Reveal, RevealScrollView } from '@/components/Reveal';
import { Text } from '@/components/Text';
import { Button, Footer, PageHeader, Paragraph, SectionTitle, openLink } from '@/components/ui';
import { card, colors, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function Careers() {
  const { t, content } = useLanguage();
  const { careers } = content;
  return (
    <RevealScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <PageHeader title={t.careers} subtitle={careers.intro} />
      <View style={styles.section}>
        <Reveal>
          <SectionTitle>{t.whyWorkWithUs}</SectionTitle>
        </Reveal>
        {careers.why.map((w, i) => (
          <Reveal key={w} delay={i * 100} from="left" style={styles.row}>
            <View style={styles.dot}>
              <Ionicons name="star" size={14} color={colors.white} />
            </View>
            <Text style={[type.body, { flex: 1 }]}>{w}</Text>
          </Reveal>
        ))}
      </View>
      <View style={styles.section}>
        <Reveal from="scale" style={styles.openings}>
          <Ionicons name="briefcase-outline" size={40} color={colors.blue} />
          <Text style={[type.h3, { marginTop: space.sm, textAlign: 'center' }]}>{t.openPositions}</Text>
          <Paragraph>{t.openPositionsText}</Paragraph>
          <Button title={t.exploreOpportunities} icon="arrow-forward" onPress={() => openLink(careers.url, t.careers)} />
        </Reveal>
      </View>
      <Footer />
    </RevealScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: space.lg, paddingTop: space.xl },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, marginBottom: space.md },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openings: { ...card, padding: space.lg, alignItems: 'center', marginBottom: space.xl },
});
