import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { card, colors, radius, space } from '@/constants/theme';
import { AuthError, deleteMediaPost, fetchMediaPosts, type MediaPost } from '@/lib/admin';
import { formatArticleDate } from '@/lib/dates';
import { confirmAction } from './confirm';
import { MediaForm } from './MediaForm';

/** Opens the public article page: a new browser tab on web, the article screen in the app. */
function viewOnSite(publicId: string) {
  if (Platform.OS === 'web') window.open(`/news/${publicId}`, '_blank');
  else router.push({ pathname: '/news/[id]', params: { id: publicId } });
}

type Mode = { kind: 'list' } | { kind: 'form'; post?: MediaPost };
type LangFilter = 'all' | 'en' | 'ar';

const LANG_FILTERS: { key: LangFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'en', label: 'English' },
  { key: 'ar', label: 'العربية' },
];

/** Media posts added by admins: list, add, edit, delete. They appear on the app's Media page. */
export function MediaView({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ text: string; publicId: string; warning?: string } | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [search, setSearch] = useState('');

  const counts = useMemo(
    () => ({
      all: posts.length,
      en: posts.filter((p) => p.lang === 'en').length,
      ar: posts.filter((p) => p.lang === 'ar').length,
    }),
    [posts],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (langFilter === 'all' || p.lang === langFilter) &&
        (!q || [p.title, p.badge, p.body].some((v) => v.toLowerCase().includes(q))),
    );
  }, [posts, langFilter, search]);

  const handle = useCallback(
    (e: unknown) => {
      if (e instanceof AuthError) return onSignOut();
      setError(e instanceof Error ? e.message : 'Something went wrong');
    },
    [onSignOut],
  );

  const load = useCallback(
    () =>
      fetchMediaPosts(token)
        .then((p) => {
          setPosts(p);
          setError('');
        }, handle)
        .finally(() => setLoading(false)),
    [token, handle],
  );

  useEffect(() => {
    fetchMediaPosts(token)
      .then(setPosts, handle)
      .finally(() => setLoading(false));
  }, [token, handle]);

  const remove = async (p: MediaPost) => {
    const both = p.pair_id ? ` Its ${p.lang === 'en' ? 'العربية' : 'English'} version will be deleted too.` : '';
    if (!(await confirmAction('Delete post', `Delete “${p.title}”? It will be removed from the Media page.${both}`))) return;
    try {
      const deleted = await deleteMediaPost(token, p.id);
      setPosts((list) => list.filter((x) => !deleted.includes(x.id)));
      setNotice(null);
    } catch (e) {
      handle(e);
    }
  };

  if (mode.kind === 'form') {
    return (
      <MediaForm
        token={token}
        post={mode.post}
        onCancel={() => setMode({ kind: 'list' })}
        onAuthError={onSignOut}
        onSaved={(saved, title) => {
          const tr = saved.translation;
          const other = (l: 'en' | 'ar') => (l === 'ar' ? 'العربية' : 'English');
          let text = `${mode.post ? 'Updated' : 'Published'} “${title}”.`;
          if (tr && (tr.status === 'created' || tr.status === 'updated')) {
            text += ` ${other(tr.lang)} version ${tr.status === 'created' ? 'published' : 'updated'} automatically.`;
          }
          const warning = tr && (tr.status === 'unavailable' || tr.status === 'failed') ? `Not translated: ${tr.message}` : undefined;
          setNotice({ text, publicId: saved.publicId, warning });
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
            <Text style={styles.h1}>Media</Text>
            <Text style={styles.sub}>All press releases shown on the app’s Home and Media pages.</Text>
          </View>
          <Pressable
            onPress={() => setMode({ kind: 'form' })}
            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.primaryText}>Add media</Text>
          </Pressable>
        </View>

        {notice ? (
          <View style={styles.notice}>
            <Ionicons name="checkmark-circle" size={18} color={colors.tealDark} />
            <Text style={styles.noticeText}>{notice.text}</Text>
            <Pressable onPress={() => viewOnSite(notice.publicId)}>
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

        <View style={styles.toolbar}>
          <View style={styles.filters}>
            {LANG_FILTERS.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setLangFilter(f.key)}
                style={[styles.chip, langFilter === f.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, langFilter === f.key && { color: colors.white }]}>
                  {f.label} ({counts[f.key]})
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search title, badge, text…"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.blue} style={{ marginTop: space.xl }} />
        ) : visible.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={40} color={colors.muted} />
            <Text style={{ color: colors.muted, marginTop: 8 }}>
              {posts.length ? 'No posts match this filter.' : 'No media posts yet. Press “Add media” to create one.'}
            </Text>
          </View>
        ) : (
          visible.map((p) => (
            <View key={p.id} style={styles.row}>
              <Image source={p.image} style={styles.thumb} contentFit="cover" />
              <View style={styles.rowBody}>
                <View style={styles.tags}>
                  <Text style={styles.badgeTag}>{p.badge}</Text>
                  <Text style={styles.langTag}>{p.lang === 'ar' ? 'العربية' : 'English'}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>
                  {p.title}
                </Text>
                <Text style={styles.date}>{formatArticleDate(p.date, p.lang)}</Text>
                <View style={styles.actions}>
                  <Action icon="eye-outline" label="View" onPress={() => viewOnSite(p.publicId)} />
                  <Action icon="create-outline" label="Edit" onPress={() => setMode({ kind: 'form', post: p })} />
                  <Action icon="trash-outline" label="Delete" color="#d64545" onPress={() => remove(p)} />
                </View>
              </View>
            </View>
          ))
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
  empty: { ...card, alignItems: 'center', padding: space.xl },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center', marginBottom: space.md },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.blue },
  chipActive: { backgroundColor: colors.blue },
  chipText: { color: colors.blue, fontSize: 13, fontWeight: '500' },
  searchBox: {
    flexGrow: 1,
    flexBasis: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 14, color: colors.ink },
  row: { ...card, flexDirection: 'row', overflow: 'hidden', marginBottom: space.md },
  thumb: { width: 150, minHeight: 130, backgroundColor: colors.line },
  rowBody: { flex: 1, padding: space.md },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badgeTag: { color: colors.teal, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  langTag: {
    fontSize: 11,
    color: colors.muted,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  title: { fontSize: 15.5, lineHeight: 21, fontWeight: '600', color: colors.ink, marginTop: 4 },
  date: { fontSize: 12, color: colors.muted, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: space.sm, marginLeft: -8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  actionText: { fontSize: 13, fontWeight: '500' },
});
