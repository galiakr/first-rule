import { chapter1 } from "@/content/chapter1";
import { chapter2 } from "@/content/chapter2";
import { chapter3 } from "@/content/chapter3";
import { perLanguage } from "@/content/tokens";
import type { Lang } from "@/content/tokens";
import type { Situation } from "@/engine/types";

/** Every chapter in order, for one language. */
export const chapters = perLanguage((lang: Lang) => [
  chapter1(lang),
  chapter2(lang),
  chapter3(lang),
]);

/** Every situation in the game, keyed by id — the lookup promptFor needs to
 * display a precedent's source situation. Keeps match.ts/game.ts free of
 * content imports; only this file (and the UI) knows about chapters. */
export const situationsById = perLanguage(
  (lang: Lang): Record<string, Situation> =>
    Object.fromEntries(
      chapters(lang)
        .flatMap((c) => c.situations)
        .map((s) => [s.id, s]),
    ),
);
