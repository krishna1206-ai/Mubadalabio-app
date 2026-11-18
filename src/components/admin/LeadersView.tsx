import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { card, colors, radius, space } from '@/constants/theme';
import {
  AuthError,
  deleteLeader,
  fetchAdminLeaders,
  type AdminLeader,
  type LeaderGroup,
  type TranslationResult,
} from '@/lib/admin';
import { confirmAction } from './confirm';
import { LeaderForm } from './LeaderForm';

type LangFilter = 'all' | 'en' | 'ar';
type Mode = { kind: 'list' } | { kind: 'form'; leader?: AdminLeader; group?: LeaderGroup };

const LANG_FILTERS: { key: LangFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'en', label: 'English' },
  { key: 'ar', label: 'العربية' },
];

const SECTIONS: { key: LeaderGroup; title: string }[] = [
  { key: 'board', title: 'Board of Directors' },
  { key: 'team', title: 'Leadership Team' },
];

/** Opens the public Leadership page: a new browser tab on web, the screen in the app. */
function viewOnSite(group: LeaderGroup) {
  const path = group === 'team' ? '/leadership?section=team' : '/leadership';
  if (Platform.OS === 'web') window.open(path, '_blank');
  else router.push(group === 'team' ? { pathname: '/leadership', params: { section: 'team' } } : '/leadership');
}

function describe(tr: TranslationResult | null) {
  if (!tr) return { extra: '', warning: undefined };
  if ('message' in tr) return { extra: '', warning: `Not translated: ${tr.message}` };
  const other = tr.lang === 'ar' ? 'العربية' : 'English';
  return { extra: ` ${other} version ${tr.status === 'created' ? 'added' : 'updated'} automatically.`, warning: undefined };
}

/** Board of Directors and Leadership Team profiles shown on the app's Leadership page. */
export function LeadersView({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [leaders, setLeaders] = useState<AdminLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ text: string; group: LeaderGroup; warning?: string } | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [langFilter, setLangFilter] = useState<LangFilter>('all');

  const handle = useCallback(
    (e: unknown) => {
      if (e instanceof AuthError) return onSignOut();
      setError(e instanceof Error ? e.message : 'Something went wrong');
    },
    [onSignOut],
  );

  const load = useCallback(
    () =>
      fetchAdminLeaders(token)
        .then((l) => {
          setLeaders(l);
          setError('');
        }, handle)
        .finally(() => setLoading(false)),
    [token, handle],
  );

  useEffect(() => {
    fetchAdminLeaders(token)
      .then(setLeaders, handle)
      .finally(() => setLoading(false));
  }, [token, handle]);

  const counts = useMemo(
    () => ({
      all: leaders.length,
      en: leaders.filter((l) => l.lang === 'en').length,
      ar: leaders.filter((l) => l.lang === 'ar').length,
    }),
    [leaders],
  );

  const remove = async (l: AdminLeader) => {
    const twin = l.pair_id ? ` The ${l.lang === 'en' ? 'العربية' : 'English'} version stays; delete it separately if needed.` : '';
    if (!(await confirmAction('Delete person', `Remove “${l.name}” from the Leadership page?${twin}`))) return;
    try {
      await deleteLeader(token, l.id);
      setLeaders((list) => list.filter((x) => x.id !== l.id));
      setNotice(null);
    } catch (e) {
      handle(e);
    }
  };

  if (mode.kind === 'form') {
    return (
      <LeaderForm
        token={token}
        leader={mode.leader}
        defaultGroup={mode.group}
        all={leaders}
        onCancel={() => setMode({ kind: 'list' })}
        onAuthError={onSignOut}
        onSaved={(saved, name) => {
          const { extra, warning } = describe(saved.translation);
          const group = mode.leader?.grp ?? mode.group ?? 'board';
          setNotice({ text: `${mode.leader ? 'Updated' : 'Added'} “${name}”.${extra}`, group, warning });
          setMode({ kind: 'list' });
          load();
        }}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: space.lg }}>
      <View style={styles.inner}>
        <View style={styles.headingRow}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.h1}>Leadership</Text>
            <Text style={styles.sub}>Board of Directors and Leadership Team on the app’s Leadership page.</Text>
          </View>
          <Pressable onPress={() => setMode({ kind: 'form' })} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}>
            <Ionicons name="person-add-outline" size={17} color={colors.white} />
            <Text style={styles.primaryText}>Add person</Text>
          </Pressable>
        </View>

        {notice ? (
          <View style={styles.notice}>
            <Ionicons name="checkmark-circle" size={18} color={colors.tealDark} />
            <Text style={styles.noticeText}>{notice.text}</Text>
            <Pressable onPress={() => viewOnSite(notice.group)}>
              <Text style={styles.link}>View on site</Text>
            </Pressable>
            <Pressable onPress={() => setNotice(null)} hitSlop={8} accessibilityLabel="Dismiss">
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          </View>
        ) : null}
        {notice?.warning ? (
          <View style={styles.warnBox}>
            <Ionicons name="warning-outline" size={18} color="#8a5a00" />
            <Text style={{ color: '#8a5a00', flex: 1 }}>{notice.warning}</Text>
          </View>
        ) : null}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#b33636" />
            <Text style={{ color: '#b33636', flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.filters}>
          {LANG_FILTERS.map((f) => (
            <Pressable key={f.key} onPress={() => setLangFilter(f.key)} style={[styles.chip, langFilter === f.key && styles.chipActive]}>
              <Text style={[styles.chipText, langFilter === f.key && { color: colors.white }]}>
                {f.label} ({counts[f.key]})
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.blue} style={{ marginTop: space.xl }} />
        ) : (
          SECTIONS.map((s) => {
            const people = leaders.filter((l) => l.grp === s.key && (langFilter === 'all' || l.lang === langFilter));
            return (
              <View key={s.key} style={{ marginBottom: space.lg }}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>
                    {s.title} <Text style={styles.sectionCount}>({people.length})</Text>
                  </Text>
                  <Pressable onPress={() => setMode({ kind: 'form', group: s.key })} style={styles.action}>
                    <Ionicons name="add" size={17} color={colors.blue} />
                    <Text style={[styles.actionText, { color: colors.blue }]}>Add to {s.key === 'board' ? 'board' : 'team'}</Text>
                  </Pressable>
                </View>
                {people.length === 0 ? (
                  <View style={styles.empty}>
                    <Text style={{ color: colors.muted }}>No one here yet.</Text>
                  </View>
                ) : (
                  people.map((l) => (
                    <View key={l.id} style={styles.row}>
                      <Image source={l.photo} style={styles.thumb} contentFit="cover" contentPosition="top" />
                      <View style={styles.rowBody}>
                        <View style={styles.tags}>
                          <Text style={styles.position}>#{l.sort_order}</Text>
                          <Text style={styles.langTag}>{l.lang === 'ar' ? 'العربية' : 'English'}</Text>
                        </View>
                        <Text style={styles.name} numberOfLines={1}>
                          {l.name}
                        </Text>
                        <Text style={styles.role} numberOfLines={1}>
                          {l.role}
                        </Text>
                        <View style={styles.actions}>
                          <Action icon="eye-outline" label="View" onPress={() => viewOnSite(l.grp)} />
                          <Action icon="create-outline" label="Edit" onPress={() => setMode({ kind: 'form', leader: l })} />
                          <Action icon="trash-outline" label="Delete" color="#d64545" onPress={() => remove(l)} />
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function Action({
  icon,
  label,
  onPress,
  color = colors.blue,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: space.md },
  headingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginBottom: space.lg,
  },
  h1: { fontSize: 24, fontWeight: '600', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.blue,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  primaryText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    padding: 12,
    borderRadius: radius.sm,
    backgroundColor: '#e3f6f4',
    marginBottom: space.md,
  },
  noticeText: { flex: 1, color: colors.tealDark, fontWeight: '500', minWidth: 160 },
  link: { color: colors.blue, fontWeight: '600' },
  warnBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.sm, backgroundColor: '#fff4dc', marginBottom: space.md },
  errorBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.sm, backgroundColor: '#fdecec', marginBottom: space.md },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: space.lg },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.blue },
  chipActive: { backgroundColor: colors.blue },
  chipText: { color: colors.blue, fontSize: 13, fontWeight: '500' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.teal },
  sectionCount: { color: colors.muted, fontWeight: '400', fontSize: 15 },
  empty: { ...card, alignItems: 'center', padding: space.lg },
  row: { ...card, flexDirection: 'row', overflow: 'hidden', marginBottom: space.sm },
  thumb: { width: 84, aspectRatio: 618 / 770, backgroundColor: colors.line },
  rowBody: { flex: 1, padding: space.sm, paddingHorizontal: space.md, justifyContent: 'center' },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  position: { fontSize: 12, fontWeight: '700', color: colors.muted },
  langTag: {
    fontSize: 11,
    color: colors.muted,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  name: { fontSize: 15.5, fontWeight: '700', color: colors.ink, marginTop: 4 },
  role: { fontSize: 13, color: colors.blue, marginTop: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6, marginLeft: -8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  actionText: { fontSize: 13, fontWeight: '500' },
});
