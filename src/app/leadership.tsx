import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { Reveal, RevealScrollView } from '@/components/Reveal';
import { Text } from '@/components/Text';
import { Footer, PageHeader, SectionTitle, directionalIcon } from '@/components/ui';
import type { Leader } from '@/constants/leadership';
import { card, colors, radius, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useLeaders } from '@/lib/useLeaders';

function LeaderCard({ leader, onPress }: { leader: Leader; onPress: () => void }) {
  const { t, isRTL } = useLanguage();
  return (
    <PressableScale onPress={onPress} style={styles.card} scaleTo={0.97}>
      <Image source={leader.photo} style={styles.photo} contentFit="cover" contentPosition="top" transition={400} />
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={2}>
          {leader.name}
        </Text>
        <Text style={styles.role} numberOfLines={2}>
          {leader.role}
        </Text>
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>{t.readMore}</Text>
          <Ionicons name={directionalIcon('arrow-forward', isRTL)} size={12} color={colors.teal} />
        </View>
      </View>
    </PressableScale>
  );
}

/** Bottom sheet that slides up with the leader's full profile. */
function BioSheet({ leader, onClose }: { leader: Leader | null; onClose: () => void }) {
  const { isRTL } = useLanguage();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState<Leader | null>(null);

  useEffect(() => {
    if (leader) {
      setShown(leader);
      Animated.timing(slide, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [leader, slide]);

  const close = () =>
    Animated.timing(slide, { toValue: 0, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(
      () => {
        setShown(null);
        onClose();
      },
    );

  if (!shown) return null;

  return (
    <Modal transparent visible onRequestClose={close} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: slide }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            direction: isRTL ? 'rtl' : 'ltr',
            maxHeight: height * 0.88,
            paddingBottom: insets.bottom + space.md,
            transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }],
          },
        ]}
      >
        <View style={styles.grabber} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: space.lg }}>
          <View style={styles.sheetHead}>
            <Image source={shown.photo} style={styles.sheetPhoto} contentFit="cover" contentPosition="top" />
            <View style={{ flex: 1 }}>
              <Text style={type.h3}>{shown.name}</Text>
              <Text style={[styles.role, { fontSize: 14, marginTop: 4 }]}>{shown.role}</Text>
            </View>
          </View>
          {shown.bio.map((p, i) => (
            <Text key={i} style={[type.body, { marginBottom: space.md }]}>
              {p}
            </Text>
          ))}
        </ScrollView>
        <Pressable onPress={close} style={styles.close} hitSlop={10}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

function Grid({ people, onSelect }: { people: Leader[]; onSelect: (l: Leader) => void }) {
  return (
    <View style={styles.grid}>
      {people.map((p, i) => (
        <Reveal key={p.id ?? p.name} delay={(i % 2) * 120} from="scale" style={styles.cell}>
          <LeaderCard leader={p} onPress={() => onSelect(p)} />
        </Reveal>
      ))}
    </View>
  );
}

export default function Leadership() {
  const { section } = useLocalSearchParams<{ section?: 'board' | 'team' }>();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [selected, setSelected] = useState<Leader | null>(null);
  const { t } = useLanguage();
  const { board, team, loading } = useLeaders();

  return (
    <>
      <RevealScrollView ref={scrollRef} style={styles.screen} showsVerticalScrollIndicator={false}>
        <PageHeader title={t.ourLeadership} subtitle={t.leadershipSubtitle} />

        <View style={styles.section}>
          <Reveal>
            <SectionTitle>{t.boardOfDirectors}</SectionTitle>
          </Reveal>
          {loading ? <ActivityIndicator color={colors.blue} style={styles.loading} /> : null}
          <Grid people={board} onSelect={setSelected} />
        </View>

        <View
          style={styles.section}
          onLayout={(e) => {
            if (section === 'team') scrollRef.current?.scrollTo({ y: e.nativeEvent.layout.y - space.md, animated: true });
          }}
        >
          <Reveal>
            <SectionTitle>{t.leadershipTeam}</SectionTitle>
          </Reveal>
          {loading ? <ActivityIndicator color={colors.blue} style={styles.loading} /> : null}
          <Grid people={team} onSelect={setSelected} />
        </View>

        <Footer />
      </RevealScrollView>
      <BioSheet leader={selected} onClose={() => setSelected(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: space.lg, paddingTop: space.xl, paddingBottom: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.md },
  cell: { width: '48%' },
  loading: { marginVertical: space.lg },
  card: { ...card, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 618 / 770, backgroundColor: colors.bgSoft },
  cardBody: { padding: space.sm, paddingBottom: space.md },
  name: { fontSize: 14, fontWeight: '700', color: colors.ink },
  role: { fontSize: 12, color: colors.blue, marginTop: 2 },
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
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,30,50,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line, marginTop: 10 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  sheetPhoto: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.bgSoft },
  close: {
    position: 'absolute',
    top: 14,
    end: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
