import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { track } from '@/lib/analytics';
import { bn } from './bn';
import { type Dictionary, en, type TranslationKey } from './en';

export type Lang = 'en' | 'bn';
export const LANGS: Lang[] = ['en', 'bn'];
const STORAGE_KEY = 'bt-lang';

const dictionaries: Record<Lang, Dictionary> = { en, bn };

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nState | null>(null);

export function translate(
  lang: Lang,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  let text = dictionaries[lang][key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

function readStoredLang(): Lang | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'bn' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

export function I18nProvider({
  children,
  initialLang = 'en',
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  // Always start with the server-rendered language to keep hydration stable,
  // then apply the visitor's stored preference after mount.
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const stored = readStoredLang();
    if (stored) setLangState((current) => (stored !== current ? stored : current));
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next;
    track('language_change', { lang: next });
  }, []);

  const t = useCallback<I18nState['t']>((key, vars) => translate(lang, key, vars), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export type { TranslationKey };
