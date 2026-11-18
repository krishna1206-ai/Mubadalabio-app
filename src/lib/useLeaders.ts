import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import type { Leader } from '@/constants/leadership';
import { useLanguage, type Lang } from '@/i18n/LanguageProvider';
import { apiUrl } from './api';

type Leaders = { board: Leader[]; team: Leader[] };

// Profiles live in the database and are managed in /admin → Leadership. Cached per language.
const cache: Partial<Record<Lang, Leaders>> = {};

const withFullPhoto = (l: Leader): Leader => (l.photo.startsWith('/') ? { ...l, photo: apiUrl(l.photo) } : l);

async function fetchLeaders(lang: Lang): Promise<Leaders> {
  const res = await fetch(apiUrl(`/api/leaders?lang=${lang}`), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Leaders request failed (${res.status})`);
  const data = (await res.json()) as Leaders;
  // Uploaded photos are served by our API; native apps need the full address.
  return { board: data.board.map(withFullPhoto), team: data.team.map(withFullPhoto) };
}

/**
 * Board of Directors and Leadership Team for the current language, from the database.
 * While loading both lists are empty (`loading` is true); if the server can't be reached, the copy
 * bundled with the app is shown. Re-fetched when the screen gains focus or the tab becomes visible.
 */
export function useLeaders() {
  const { lang, content } = useLanguage();
  const [data, setData] = useState<Partial<Record<Lang, Leaders | null>>>(() => ({ ...cache }));

  const refresh = useCallback(() => {
    let active = true;
    fetchLeaders(lang)
      .then((d) => {
        cache[lang] = d;
        if (active) setData((p) => ({ ...p, [lang]: d }));
      })
      .catch(() => active && setData((p) => ({ ...p, [lang]: p[lang] ?? null })));
    return () => {
      active = false;
    };
  }, [lang]);

  useFocusEffect(refresh);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  const loaded = data[lang];
  if (loaded === undefined) return { board: [], team: [], loading: true };
  return { ...(loaded ?? { board: content.board, team: content.team }), loading: false };
}
