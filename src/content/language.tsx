"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import { DEFAULT_LANG, LANG_DIR, isLang, translator } from "@/content/tokens";
import type { Lang, Translate } from "@/content/tokens";

const STORAGE_KEY = "first-rule:lang";

// The chosen language lives in localStorage, which is an external store, so
// it's read through useSyncExternalStore rather than copied into state by an
// effect. That also gets the server/hydration case right for free: the
// prerendered markup uses DEFAULT_LANG, and React re-renders with the stored
// choice after hydrating, instead of mismatching.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab switching language should move this one too.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Private mode or blocked storage: the default language is fine.
  }
  return DEFAULT_LANG;
}

function getServerSnapshot(): Lang {
  return DEFAULT_LANG;
}

function store(next: Lang): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not being able to remember the choice shouldn't break the switch.
  }
  for (const listener of listeners) listener();
}

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

const LanguageContext = createContext<LanguageValue | null>(null);

/**
 * Holds the chosen language and keeps <html lang/dir> in step with it.
 *
 * No game state lives here, so switching language mid-chapter keeps the
 * child's rules, precedents and position exactly where they were — only the
 * words change.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANG_DIR[lang];
  }, [lang]);

  const setLang = useCallback((next: Lang) => store(next), []);

  const value = useMemo(
    () => ({ lang, setLang, t: translator(lang) }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }
  return value;
}

/** The current language on its own, for content/option factories. */
export function useLang(): Lang {
  return useLanguage().lang;
}

/** `t` bound to the current language — the same call shape as before. */
export function useT(): Translate {
  return useLanguage().t;
}
