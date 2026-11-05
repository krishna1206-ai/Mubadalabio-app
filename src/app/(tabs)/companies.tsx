import { StyleSheet, View } from 'react-native';

import { Reveal, RevealScrollView } from '@/components/Reveal';
import { Footer, PageHeader } from '@/components/ui';
import { VerticalCard } from '@/components/VerticalCard';
import { colors, space } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function Companies() {
  const { t, content } = useLanguage();
  return (
    <RevealScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <PageHeader title={t.companies} subtitle={t.companiesSubtitle} />
      <View style={styles.section}>
        {content.verticals.map((v, i) => (
          <Reveal key={v.slug} delay={i * 150} from={i % 2 ? 'right' : 'left'}>
            <VerticalCard vertical={v} />
          </Reveal>
        ))}
      </View>
      <Footer />
    </RevealScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  section: { padding: space.lg },
});
