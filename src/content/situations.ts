import { CHAPTER_1 } from "@/content/chapter1";
import { CHAPTER_2 } from "@/content/chapter2";
import type { Situation } from "@/engine/types";

/** Every situation in the game, keyed by id — the lookup promptFor needs to
 * display a precedent's source situation. Keeps match.ts/game.ts free of
 * content imports; only this file (and the UI) knows about chapters. */
export const SITUATIONS_BY_ID: Record<string, Situation> = Object.fromEntries(
  [...CHAPTER_1, ...CHAPTER_2].map((s) => [s.id, s]),
);
