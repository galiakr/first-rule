import en from "./locales/en.json";
import he from "./locales/he.json";

export const LANGUAGES = ["he", "en"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const DEFAULT_LANG: Lang = "he";

/** Writing direction per language — drives `dir` on <html>. */
export const LANG_DIR: Record<Lang, "rtl" | "ltr"> = { he: "rtl", en: "ltr" };

/** Each language named in itself, for the switcher. Never translated. */
export const LANG_LABEL: Record<Lang, string> = { he: "עברית", en: "English" };

const DICTS: Record<Lang, unknown> = { he, en };

export function isLang(value: unknown): value is Lang {
  return (
    typeof value === "string" &&
    (LANGUAGES as readonly string[]).includes(value)
  );
}

function lookup(dict: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      dict,
    );
}

function fillVars(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export type Translate = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

/**
 * A `t` bound to one language.
 *
 * Everything user-facing is built through one of these rather than a global,
 * so a language switch is just a different `lang` flowing through the same
 * code. Missing keys fall back to the default language and then to the key
 * itself, so a half-translated locale degrades to Hebrew rather than to
 * blank screens — and an untranslated string is still obvious on screen.
 */
export function translator(lang: Lang): Translate {
  return (key, vars = {}) => {
    const value = lookup(DICTS[lang], key);
    if (typeof value === "string" && value.length > 0)
      return fillVars(value, vars);

    if (lang !== DEFAULT_LANG) {
      const fallback = lookup(DICTS[DEFAULT_LANG], key);
      if (typeof fallback === "string" && fallback.length > 0) {
        return fillVars(fallback, vars);
      }
    }
    return key;
  };
}

/**
 * Wraps a builder so each language's result is computed once and reused.
 *
 * Content and option tables are built from tokens, so they have to be
 * functions of the language rather than module constants. Memoizing keeps
 * their identity stable across renders, which matters because they end up
 * as `useMemo` dependencies and React keys.
 */
export function perLanguage<T>(build: (lang: Lang) => T): (lang: Lang) => T {
  const cache = new Map<Lang, T>();
  return (lang) => {
    const hit = cache.get(lang);
    if (hit !== undefined) return hit;
    const built = build(lang);
    cache.set(lang, built);
    return built;
  };
}
