import { perLanguage, translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";
import type { Actor, GroupId } from "@/engine/types";

export const groupBlurb = perLanguage((lang: Lang): Record<GroupId, string> => {
  const t = translator(lang);
  return {
    "old-timers": t("village.groups.old-timers.blurb"),
    newcomers: t("village.groups.newcomers.blurb"),
    shepherds: t("village.groups.shepherds.blurb"),
    builders: t("village.groups.builders.blurb"),
    children: t("village.groups.children.blurb"),
    "passers-through": t("village.groups.passers-through.blurb"),
  };
});

/**
 * The screen before the village opens (§4). Names the six groups by what
 * moves them, not by role — and says what the child's own role is not:
 * nobody appointed it.
 */
export const about = perLanguage((lang: Lang) => {
  const t = translator(lang);
  return {
    title: t("about.title"),
    villageText: t("about.village_text"),
    meText: t("about.me_text"),
  };
});

export const actors = perLanguage((lang: Lang): Record<string, Actor> => {
  const t = translator(lang);
  return {
    yotam: {
      id: "yotam",
      name: t("village.actors.yotam.name"),
      groups: ["old-timers"],
      resident: true,
    },
    dana: {
      id: "dana",
      name: t("village.actors.dana.name"),
      groups: ["shepherds"],
      resident: true,
    },
    shira: {
      id: "shira",
      // A child, and the one who brings you water every morning.
      // Situation 3 exists to make her the one the rule bites.
      name: t("village.actors.shira.name"),
      groups: ["children", "shepherds"],
      resident: true,
    },
    barak: {
      id: "barak",
      name: t("village.actors.barak.name"),
      groups: ["builders"],
      resident: true,
    },
    michal: {
      id: "michal",
      name: t("village.actors.michal.name"),
      groups: ["newcomers"],
      resident: true,
    },
    noam: {
      id: "noam",
      name: t("village.actors.noam.name"),
      groups: ["passers-through"],
      resident: false,
    },
  };
});

export function actor(id: string, lang: Lang): Actor {
  const a = actors(lang)[id];
  if (!a) throw new Error(`Unknown actor: ${id}`);
  return a;
}

/**
 * The child, for situations where they're the actor/victim (Chapter 3, §9).
 * Deliberately NOT part of `actors` — LinkedText scans every actor name as a
 * substring to linkify in prose, and "אתה" / "you" is far too common a word
 * for that; it would highlight huge parts of the game's ordinary narration.
 * Only merge this in at the one call site that needs it for rule matching
 * (page.tsx's promptFor call), never into the shared registry.
 *
 * groups: [] is not an oversight — it's the mechanism. A group-scoped rule
 * can never reach the child directly, but an everyone-except rule always
 * does, since they can never be the excluded group. That's real gameplay,
 * not a workaround (see docs/chapter-3-plan.md).
 */
export const childActor = perLanguage((lang: Lang): Actor => ({
  id: "you",
  name: translator(lang)("common.you"),
  groups: [],
  resident: true,
}));

/** The registry plus the child, for rule matching only. Never for LinkedText. */
export const actorsWithChild = perLanguage(
  (lang: Lang): Record<string, Actor> => ({
    ...actors(lang),
    you: childActor(lang),
  }),
);
