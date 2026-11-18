import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, Animated, Share, StyleSheet, View } from 'react-native';

import { Reveal, RevealContainer } from '@/components/Reveal';
import { Text } from '@/components/Text';
import { Button, openLink } from '@/components/ui';
import { colors, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useArticles } from '@/lib/useArticles';

const HERO = 260;

export default function Article() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { articles, loading } = useArticles();
  const found = articles.find((a) => a.id === id);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Admin-added posts arrive from the API; wait for them before falling back to the latest article.
  if (!found && loading) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }
  const article = found ?? articles[0];
  if (!article) return <View style={styles.screen} />;

  // Parallax: the photo moves slower than the content and zooms when pulled down.
  const imageStyle = {
    transform: [
      { translateY: scrollY.interpolate({ inputRange: [-HERO, 0, HERO], outputRange: [-HERO / 2, 0, HERO * 0.5] }) },
      { scale: scrollY.interpolate({ inputRange: [-HERO, 0], outputRange: [2, 1], extrapolateRight: 'clamp' }) },
    ],
  };

  return (
    <RevealContainer>
      {(onScroll) => (
        <Animated.ScrollView
          style={styles.screen}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
            listener: onScroll,
          })}
        >
          <Animated.View style={[styles.hero, imageStyle]}>
            <Image source={article.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
          </Animated.View>
          <View style={styles.body}>
            <Reveal>
              <Text style={styles.tag}>{article.badge ?? t.pressRelease}</Text>
              <Text style={type.h1}>{article.title}</Text>
              <Text style={[type.small, { marginTop: space.sm, marginBottom: space.lg }]}>{article.date}</Text>
            </Reveal>
            {article.body.map((p, i) => (
              <Reveal key={i}>
                <Text style={[type.body, { marginBottom: space.md }]}>{p}</Text>
              </Reveal>
            ))}
            <View style={styles.actions}>
              <Button
                title={t.share}
                icon="share-social"
                onPress={() => Share.share({ message: article.url ? `${article.title}\n${article.url}` : article.title })}
              />
              {article.url ? (
                <Button
                  title={t.viewOnline}
                  variant="outline"
                  icon="arrow-forward"
                  onPress={() => openLink(article.url, article.badge ?? t.pressRelease)}
                />
              ) : null}
            </View>
          </View>
        </Animated.ScrollView>
      )}
    </RevealContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { height: HERO, backgroundColor: colors.bgSoft, overflow: 'hidden' },
  body: {
    backgroundColor: colors.bg,
    padding: space.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  tag: { color: colors.teal, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.md, marginBottom: space.xl, flexWrap: 'wrap' },
});
