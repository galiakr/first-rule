import CharacterName from "@/components/CharacterName";
import { ACTORS } from "@/content/village";

// Longest name first, so a name that happens to be a prefix of another
// (none today, but content changes) never gets shadowed by a shorter match.
const ACTOR_LIST = Object.values(ACTORS).sort(
  (a, b) => b.name.length - a.name.length,
);

const NAME_BY_TEXT = new Map(ACTOR_LIST.map((a) => [a.name, a.id]));

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Hebrew prepositions/conjunctions attach directly to the next word with no
// space (e.g. "לשירה" = "to שירה"), so this matches the name as a plain
// substring rather than requiring a word boundary — \b doesn't know Hebrew
// letters are word characters anyway. The prefix stays as plain text before
// the highlighted name.
const PATTERN = new RegExp(
  `(${ACTOR_LIST.map((a) => escapeRegExp(a.name)).join("|")})`,
  "g",
);

/**
 * Renders prose with every character mention turned into a hoverable
 * CharacterName. Only use this on plain text (situation scene/outcome/lesson
 * copy) — never inside a button, since the mention itself is focusable.
 */
export default function LinkedText({ text }: { text: string }) {
  if (ACTOR_LIST.length === 0) return <>{text}</>;

  const parts = text.split(PATTERN);
  return (
    <>
      {parts.map((part, i) => {
        const actorId = NAME_BY_TEXT.get(part);
        return actorId ? <CharacterName key={i} actorId={actorId} /> : part;
      })}
    </>
  );
}
