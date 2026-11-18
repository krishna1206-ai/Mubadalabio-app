import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { Reveal, RevealScrollView } from '@/components/Reveal';
import { Text } from '@/components/Text';
import { Button, Footer, PageHeader, directionalIcon } from '@/components/ui';
import type { Article } from '@/constants/content';
import { card, colors, radius, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useArticles } from '@/lib/useArticles';

const PAGE = 8;

const openArticle = (a: Article) => router.push({ pathname: '/news/[id]', params: { id: a.id } });

/** Newest release: full-width photo with the headline over a dark gradient. */
function FeaturedCard({ article }: { article: Article }) {
  const { t } = useLanguage();
  return (
    <PressableScale onPress={() => openArticle(article)} style={styles.featured} scaleTo={0.98}>
      <Image source={article.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
      <LinearGradient
        colors={['transparent', 'rgba(5,25,55,0.9)']}
        start={{ x: 0, y: 0.25 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.featuredBody}>
        <Text style={styles.featuredTag}>{article.badge ?? t.pressRelease}</Text>
        <Text style={styles.featuredTitle} numberOfLines={4}>
          {article.title}
        </Text>
        <Text style={styles.featuredDate}>{article.date}</Text>
      </View>
    </PressableScale>
  );
}

/** Compact row: thumbnail, headline, date and Read More, like the website's list. */
function ArticleRow({ article }: { article: Article }) {
  const { t, isRTL } = useLanguage();
  return (
    <PressableScale onPress={() => openArticle(article)} style={styles.row} scaleTo={0.98}>
      <Image source={article.image} style={styles.thumb} contentFit="cover" transition={300} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={3}>
          {article.title}
        </Text>
        <Text style={[type.small, { marginTop: 4 }]}>{article.date}</Text>
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>{t.readMore}</Text>
          <Ionicons name={directionalIcon('arrow-forward', isRTL)} size={12} color={colors.teal} />
        </View>
      </View>
    </PressableScale>
  );
}

export default function Media() {
  const { t } = useLanguage();
  // Like the website's page 1 / page 2: the newest releases first, more on request.
  const [visible, setVisible] = useState(PAGE);
  const { articles, loading } = useArticles();
  const [featured, ...rest] = articles;
  const shown = rest.slice(0, visible);
  const remaining = rest.length - shown.length;

  return (
    <RevealScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <PageHeader title={t.media} subtitle={t.mediaIntro} />
      <View style={styles.section}>
        {loading && !featured ? <ActivityIndicator color={colors.blue} style={styles.loading} /> : null}
        {featured ? (
          <Reveal from="scale">
            <FeaturedCard article={featured} />
          </Reveal>
        ) : null}
        {shown.map((a, i) => (
          <Reveal key={a.id} delay={(i % PAGE) * 60}>
            <ArticleRow article={a} />
          </Reveal>
        ))}
        {remaining > 0 && (
          <Button
            title={`${t.loadMore} (${remaining})`}
            variant="outline"
            icon="chevron-down"
            onPress={() => setVisible((v) => v + PAGE)}
            style={styles.loadMore}
          />
        )}
      </View>
      <Footer />
    </RevealScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  section: { padding: space.lg },
  featured: { ...card, height: 300, overflow: 'hidden', marginBottom: space.lg, backgroundColor: colors.blueDark },
  featuredBody: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.lg },
  featuredTag: { color: colors.teal, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  featuredTitle: { color: colors.white, fontSize: 20, lineHeight: 27, fontWeight: '700' },
  featuredDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: space.sm },
  row: { ...card, flexDirection: 'row', overflow: 'hidden', marginBottom: space.md },
  thumb: { width: 118, minHeight: 118, backgroundColor: colors.bgSoft },
  rowBody: { flex: 1, padding: space.sm, paddingHorizontal: space.md, justifyContent: 'center' },
  rowTitle: { fontSize: 14.5, lineHeight: 20, fontWeight: '600', color: colors.ink },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: space.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: colors.teal,
  },
  readMoreText: { fontSize: 11, color: colors.teal, fontWeight: '600' },
  loading: { marginVertical: space.xl },
  loadMore: { alignSelf: 'center', marginTop: space.sm },
});
