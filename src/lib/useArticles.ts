import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import type { Article } from '@/constants/content';
import { useLanguage, type Lang } from '@/i18n/LanguageProvider';
import { apiUrl } from './api';

// All press releases live in the database and are managed in /admin → Media.
// Cached per language so moving between screens doesn't flash; refreshed in the background.
const cache: Partial<Record<Lang, Article[]>> = {};

async function fetchPosts(lang: Lang): Promise<Article[]> {
  const res = await fetch(apiUrl(`/api/media?lang=${lang}`), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Media request failed (${res.status})`);
  const { articles } = (await res.json()) as { articles: Article[] };
  // Uploaded images are served by our API; native apps need the full address.
  return articles.map((a) => (a.image.startsWith('/') ? { ...a, image: apiUrl(a.image) } : a));
}

/**
 * Press releases for the current language, from the database.
 * While loading the list is empty (`loading` is true); if the server can't be reached, the copy
 * bundled with the app is shown.
 * Re-fetched whenever the screen comes into focus or the browser tab becomes visible again,
 * so posts published in /admin show up without a full page reload.
 * `loading` is true until the first response (or failure).
 */
export function useArticles() {
  const { lang, content } = useLanguage();
  const [posts, setPosts] = useState<Partial<Record<Lang, Article[] | null>>>(() => ({ ...cache }));

  const refresh = useCallback(() => {
    let active = true;
    fetchPosts(lang)
      .then((list) => {
        cache[lang] = list;
        if (active) setPosts((p) => ({ ...p, [lang]: list }));
      })
      // Offline or backend unavailable: keep what we have, else the bundled articles (null = failed).
      .catch(() => active && setPosts((p) => ({ ...p, [lang]: p[lang] ?? null })));
    return () => {
      active = false;
    };
  }, [lang]);

  // Runs when the screen gains focus (and again when the language changes).
  useFocusEffect(refresh);

  // Web: also refresh when the user comes back to this browser tab.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  const loaded = posts[lang];
  // undefined = still loading (show a spinner, not old content that may since have changed);
  // null = server unreachable (fall back to the copy bundled with the app).
  const articles = loaded === undefined ? [] : (loaded ?? content.articles);
  return { articles, loading: loaded === undefined };
}
