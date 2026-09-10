import he from "./locales/he.json";

/**
 * The whole game is Hebrew-only for now (design doc §3, §11) — there is no
 * language switcher yet. `dict` still exists as a seam: swapping it for
 * another locale JSON later doesn't touch any call site.
 */
const dict: unknown = he;

function lookup(key: string): unknown {
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

/**
 * Looks up a token by dotted key and fills `{placeholder}` slots. Falls back
 * to the key itself when missing, so an untranslated string is obvious
 * on-screen instead of crashing.
 */
export function t(
  key: string,
  vars: Record<string, string | number> = {},
): string {
  const value = lookup(key);
  if (typeof value !== "string") return key;
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
