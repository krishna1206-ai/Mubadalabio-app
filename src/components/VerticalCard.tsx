import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { Vertical } from '@/constants/content';
import { card, colors, radius, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { directionalIcon } from './ui';

export function VerticalCard({ vertical }: { vertical: Vertical }) {
  const { t, isRTL } = useLanguage();
  const open = () => router.push({ pathname: '/company/[slug]', params: { slug: vertical.slug } });
  return (
    <PressableScale onPress={open} style={[styles.card, { borderColor: vertical.color }]} scaleTo={0.98}>
      <View style={[styles.head, { backgroundColor: vertical.color }]}>
        <Text style={[styles.title, { flex: 1 }]}>{vertical.title}</Text>
        <Ionicons name={directionalIcon('arrow-forward', isRTL)} size={18} color={colors.white} />
      </View>
      <View style={styles.body}>
        <Text style={type.body} numberOfLines={4}>
          {vertical.summary}
        </Text>
        <View style={styles.logos}>
          {vertical.subsidiaries.map((s) => (
            <Image key={s.name} source={s.logo} style={styles.logo} contentFit="contain" transition={300} />
          ))}
        </View>
        <Text style={[styles.more, { color: vertical.color }]}>{t.exploreMore}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { ...card, borderWidth: 1.5, overflow: 'hidden', marginBottom: space.md },
  head: {
    paddingHorizontal: space.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: radius.md - 2,
    borderTopRightRadius: radius.md - 2,
  },
  title: { color: colors.white, fontSize: 17, fontWeight: '600' },
  body: { padding: space.md },
  logos: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.md, alignItems: 'center' },
  logo: { width: 68, height: 32 },
  more: { marginTop: space.md, fontWeight: '700' },
});
