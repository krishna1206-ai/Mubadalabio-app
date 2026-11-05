import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { Article } from '@/constants/content';
import { card, colors, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export function NewsCard({ article }: { article: Article }) {
  const { t } = useLanguage();
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/news/[id]', params: { id: article.id } })}
      style={styles.card}
      scaleTo={0.98}
    >
      <Image source={article.image} style={styles.image} contentFit="cover" transition={400} />
      <View style={styles.body}>
        <Text style={styles.tag}>{t.pressRelease}</Text>
        <Text style={type.h3} numberOfLines={3}>
          {article.title}
        </Text>
        <Text style={[type.small, { marginTop: space.xs }]}>{article.date}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { ...card, overflow: 'hidden', marginBottom: space.md },
  image: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.bgSoft },
  body: { padding: space.md },
  tag: { color: colors.teal, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
});
