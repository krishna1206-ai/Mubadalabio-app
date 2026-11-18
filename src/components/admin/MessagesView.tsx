import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { card, colors, radius, space } from '@/constants/theme';
import { confirmAction } from './confirm';
import { AuthError, deleteMessage, fetchMessages, setMessageStatus, type AdminMessage } from '@/lib/admin';

type Filter = 'all' | 'new' | 'read';

/** Contact form submissions: list, filter, search, mark read/new, delete. */
export function MessagesView({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const handle = useCallback(
    (e: unknown) => {
      if (e instanceof AuthError) return onSignOut(); // session expired
      setError(e instanceof Error ? e.message : 'Something went wrong');
    },
    [onSignOut],
  );

  const load = useCallback(async () => {
    try {
      setMessages(await fetchMessages(token));
      setError('');
    } catch (e) {
      handle(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, handle]);

  // Load now, then check for new messages every 10 seconds so new submissions appear on their own.
  // State is only set once a request settles, never synchronously here.
  useEffect(() => {
    const poll = () =>
      fetchMessages(token)
        .then(setMessages, handle)
        .finally(() => setLoading(false));
    poll();
    const timer = setInterval(poll, 10_000);
    return () => clearInterval(timer);
  }, [token, handle]);

  const toggleStatus = async (m: AdminMessage) => {
    const status = m.status === 'new' ? 'read' : 'new';
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, status } : x)));
    try {
      await setMessageStatus(token, m.id, status);
    } catch (e) {
      setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, status: m.status } : x)));
      handle(e);
    }
  };

  const remove = async (m: AdminMessage) => {
    if (!(await confirmAction('Delete message', `Delete the message from ${m.name}? This cannot be undone.`))) return;
    try {
      await deleteMessage(token, m.id);
      setMessages((list) => list.filter((x) => x.id !== m.id));
    } catch (e) {
      handle(e);
    }
  };

  const counts = useMemo(
    () => ({
      all: messages.length,
      new: messages.filter((m) => m.status === 'new').length,
      read: messages.filter((m) => m.status === 'read').length,
    }),
    [messages],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter(
      (m) =>
        (filter === 'all' || m.status === filter) &&
        (!q || [m.name, m.email, m.mobile, m.message, m.department].some((v) => v.toLowerCase().includes(q))),
    );
  }, [messages, filter, search]);

  return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: space.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => (setRefreshing(true), load())} />}
      >
        <View style={styles.inner}>
          <View style={styles.headingRow}>
            <Text style={styles.h1}>Contact messages</Text>
            <Pressable onPress={() => (setRefreshing(true), load())} style={styles.ghostButton} accessibilityLabel="Refresh">
              <Ionicons name="refresh" size={18} color={colors.blue} />
              <Text style={[styles.ghostText, { color: colors.blue }]}>Refresh</Text>
            </Pressable>
          </View>

          <View style={styles.stats}>
            <Stat label="Total" value={counts.all} icon="mail-outline" color={colors.blue} />
            <Stat label="New" value={counts.new} icon="mail-unread-outline" color={colors.teal} />
            <Stat label="Read" value={counts.read} icon="checkmark-done-outline" color={colors.muted} />
          </View>

          <View style={styles.toolbar}>
            <View style={styles.filters}>
              {(['all', 'new', 'read'] as const).map((f) => (
                <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
                  <Text style={[styles.chipText, filter === f && { color: colors.white }]}>
                    {f[0].toUpperCase() + f.slice(1)} ({counts[f]})
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={colors.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search name, email, message…"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#b33636" />
              <Text style={{ color: '#b33636', flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator color={colors.blue} style={{ marginTop: space.xl }} />
          ) : visible.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={40} color={colors.muted} />
              <Text style={{ color: colors.muted, marginTop: 8 }}>
                {messages.length ? 'No messages match this filter.' : 'No messages yet.'}
              </Text>
            </View>
          ) : (
            visible.map((m) => (
              <MessageCard key={m.id} m={m} onToggle={() => toggleStatus(m)} onDelete={() => remove(m)} />
            ))
          )}
        </View>
      </ScrollView>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: number; icon: keyof typeof Ionicons.glyphMap; color: string }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color={colors.white} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function MessageCard({ m, onToggle, onDelete }: { m: AdminMessage; onToggle: () => void; onDelete: () => void }) {
  const isNew = m.status === 'new';
  return (
    <View style={[styles.message, isNew && { borderLeftColor: colors.teal }]}>
      <View style={styles.messageHead}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.name}>{m.name}</Text>
            {isNew ? (
              <View style={styles.newPill}>
                <Text style={styles.newPillText}>NEW</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.meta}>
            {m.department} · {new Date(m.created_at).toLocaleString()}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={onToggle} style={styles.ghostButton}>
            <Ionicons name={isNew ? 'checkmark-done-outline' : 'mail-unread-outline'} size={16} color={colors.blue} />
            <Text style={[styles.ghostText, { color: colors.blue }]}>{isNew ? 'Mark read' : 'Mark new'}</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.ghostButton} accessibilityLabel="Delete message">
            <Ionicons name="trash-outline" size={16} color="#d64545" />
            <Text style={[styles.ghostText, { color: '#d64545' }]}>Delete</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.contactRow}>
        <Pressable onPress={() => Linking.openURL(`mailto:${m.email}`)} style={styles.contactLink}>
          <Ionicons name="mail-outline" size={14} color={colors.blue} />
          <Text style={styles.link}>{m.email}</Text>
        </Pressable>
        {m.mobile ? (
          <Pressable onPress={() => Linking.openURL(`tel:${m.mobile}`)} style={styles.contactLink}>
            <Ionicons name="call-outline" size={14} color={colors.blue} />
            <Text style={styles.link}>{m.mobile}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.body}>{m.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgSoft },
  inner: { width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: space.md },
  topBar: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  h1: { fontSize: 24, fontWeight: '600', color: colors.ink },
  ghostButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.sm },
  ghostText: { color: colors.ink, fontWeight: '500', fontSize: 14 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginBottom: space.lg },
  stat: { ...card, flexGrow: 1, flexBasis: 150, flexDirection: 'row', alignItems: 'center', gap: 12, padding: space.md },
  statIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.ink },
  statLabel: { fontSize: 12, color: colors.muted },
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
  errorBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.sm, backgroundColor: '#fdecec', marginBottom: space.md },
  empty: { ...card, alignItems: 'center', padding: space.xl },
  message: { ...card, padding: space.md, marginBottom: space.md, borderLeftWidth: 4, borderLeftColor: colors.line },
  messageHead: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink },
  newPill: { backgroundColor: colors.teal, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  newPillText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm },
  contactLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  link: { color: colors.blue, fontSize: 13 },
  body: { marginTop: space.sm, fontSize: 14, lineHeight: 21, color: colors.text },
});
