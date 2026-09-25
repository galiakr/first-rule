"use client";

import CharacterName from "@/components/CharacterName";
import { useLang } from "@/content/language";
import { actors } from "@/content/village";
import type { Lang } from "@/content/tokens";
import { perLanguage } from "@/content/tokens";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Hebrew prepositions/conjunctions attach directly to the next word with no
// space (e.g. "לשירה" = "to שירה"), so this matches the name as a plain
// substring rather than requiring a word boundary — \b doesn't know Hebrew
// letters are word characters anyway. The prefix stays as plain text before
// the highlighted name. English names match the same way.
const matcher = perLanguage((lang: Lang) => {
  // Longest name first, so a name that happens to be a prefix of another
  // (none today, but content changes) never gets shadowed by a shorter match.
  const list = Object.values(actors(lang)).sort(
    (a, b) => b.name.length - a.name.length,
  );
  return {
    idByName: new Map(list.map((a) => [a.name, a.id])),
    pattern:
      list.length === 0
        ? null
        : new RegExp(
            `(${list.map((a) => escapeRegExp(a.name)).join("|")})`,
            "g",
          ),
  };
});

/**
 * Renders prose with every character mention turned into a hoverable
 * CharacterName. Only use this on plain text (situation scene/outcome/lesson
 * copy) — never inside a button, since the mention itself is focusable.
 */
export default function LinkedText({ text }: { text: string }) {
  const lang = useLang();
  const { idByName, pattern } = matcher(lang);
  if (!pattern) return <>{text}</>;

  // split() ignores a global regex's lastIndex, so the shared pattern is safe.
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const actorId = idByName.get(part);
        return actorId ? <CharacterName key={i} actorId={actorId} /> : part;
      })}
    </>
  );
}
