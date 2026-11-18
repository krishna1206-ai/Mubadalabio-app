import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/ui';
import { colors, radius, space } from '@/constants/theme';
import { LeadersView } from './LeadersView';
import { MediaView } from './MediaView';
import { MessagesView } from './MessagesView';

type Tab = 'messages' | 'media' | 'leadership';

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'messages', label: 'Messages', icon: 'mail-outline' },
  { key: 'media', label: 'Media', icon: 'newspaper-outline' },
  { key: 'leadership', label: 'Leadership', icon: 'people-outline' },
];

/** Signed-in admin area: header with tabs, then the selected section. */
export function AdminPanel({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('messages');

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <View style={styles.brand}>
              <Logo width={110} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Admin</Text>
              </View>
            </View>
            <Pressable onPress={onSignOut} style={styles.signOut} accessibilityLabel="Sign out">
              <Ionicons name="log-out-outline" size={18} color={colors.ink} />
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </View>

          <View style={styles.tabs} accessibilityRole="tablist">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={[styles.tab, active && styles.tabActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons name={t.icon} size={17} color={active ? colors.blue : colors.muted} />
                  <Text style={[styles.tabText, active && { color: colors.blue }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {tab === 'messages' ? <MessagesView token={token} onSignOut={onSignOut} /> : null}
      {tab === 'media' ? <MediaView token={token} onSignOut={onSignOut} /> : null}
      {tab === 'leadership' ? <LeadersView token={token} onSignOut={onSignOut} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgSoft },
  inner: { width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: space.md },
  topBar: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line, paddingTop: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  signOut: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7 },
  signOutText: { color: colors.ink, fontWeight: '500', fontSize: 14 },
  tabs: { flexDirection: 'row', gap: space.lg, marginTop: space.sm },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.blue },
  tabText: { fontSize: 14.5, fontWeight: '600', color: colors.muted },
});
