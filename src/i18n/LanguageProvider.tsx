import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  about,
  careers,
  departments,
  intro,
  office,
  SITE,
  stats,
  verticals,
} from '@/constants/content';
import { aboutAr, careersAr, departmentsAr, introAr, officeAr, statsAr, verticalsAr } from '@/constants/content.ar';
import { board, team } from '@/constants/leadership';
import { board as boardAr, team as teamAr } from '@/constants/leadership.ar';
import { articlesEn } from '@/constants/news';
import { articlesAr } from '@/constants/news.ar';
import { strings } from './strings';

export type Lang = 'en' | 'ar';

const STORAGE_KEY = 'mubadalabio.language';

const contentByLang = {
  en: {
    intro,
    stats,
    about,
    verticals,
    articles: articlesEn,
    careers,
    board,
    team,
    officeAddress: office.address,
    departmentLabel: (d: string) => d,
    privacyUrl: `${SITE}/privacy-policy/`,
    contactUrl: `${SITE}/contact-us/`,
  },
  ar: {
    intro: introAr,
    stats: statsAr,
    about: aboutAr,
    verticals: verticalsAr,
    articles: articlesAr,
    careers: careersAr,
    board: boardAr,
    team: teamAr,
    officeAddress: officeAr,
    departmentLabel: (d: string) => departmentsAr[d] ?? d,
    privacyUrl: encodeURI(`${SITE}/ar/سياسة-الخصوصية/`),
    contactUrl: encodeURI(`${SITE}/ar/للتواصل/`),
  },
};

type LanguageContextValue = {
  lang: Lang;
  isRTL: boolean;
  setLang: (lang: Lang) => void;
  t: (typeof strings)['en'];
  content: (typeof contentByLang)['en'];
  /** Department keys (English) used as stable form values. */
  departments: string[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function deviceLang(): Lang {
  return getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';
}

/** Holds the chosen language, remembers it between launches, and exposes matching text and content. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(deviceLang);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'ar') setLangState(saved);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      isRTL: lang === 'ar',
      setLang: (next) => {
        setLangState(next);
        AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      },
      t: strings[lang],
      content: contentByLang[lang],
      departments,
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
