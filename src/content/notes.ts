/**
 * מחברת המושגים — the notebook.
 *
 * One note per chapter, naming the thing that chapter was actually about.
 * Deliberately separate from the chapter content itself: §2's rule is that
 * the game never explains the concept before it has been felt, so a note is
 * only readable once its chapter has been *finished* (see `Notes.tsx` and the
 * `unlockedChapters` computation in page.tsx). Until then the child sees the
 * chapter title and nothing else.
 *
 * `grownUp` is the one place in the game that uses adult vocabulary —
 * "שלטון החוק", "תקדים", "שוויון בפני החוק". It exists so the idea can be
 * looked up and talked about later, not so the game can teach it in those
 * words; nothing in the playable chapters ever says them.
 *
 * `questions` are open on purpose. §2: the game never says the child was
 * wrong, and a question with a right answer would break that here too.
 *
 * Adding chapters 4–7: append an entry with the matching `notes.c<n>.*`
 * tokens. The engine test pins one note per built chapter, so a new chapter
 * without a note fails the suite rather than silently showing a gap.
 */

import { perLanguage, translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";

export interface ChapterNote {
  /** 1-based chapter number — must line up with the CHAPTERS array. */
  chapter: number;
  /** The idea in the child's own vocabulary, one line. */
  concept: string;
  /** What happened in the chapter that made the idea felt. */
  whatHappened: string;
  /** The same idea in the words grown-ups use for it. */
  grownUp: string;
  /** Open questions to talk about later. Never fewer than two. */
  questions: string[];
}

export const chapterNotes = perLanguage((lang: Lang): ChapterNote[] => {
  const t = translator(lang);
  return [
    {
      chapter: 1,
      concept: t("notes.c1.concept"),
      whatHappened: t("notes.c1.what_happened"),
      grownUp: t("notes.c1.grown_up"),
      questions: [t("notes.c1.q1"), t("notes.c1.q2"), t("notes.c1.q3")],
    },
    {
      chapter: 2,
      concept: t("notes.c2.concept"),
      whatHappened: t("notes.c2.what_happened"),
      grownUp: t("notes.c2.grown_up"),
      questions: [t("notes.c2.q1"), t("notes.c2.q2"), t("notes.c2.q3")],
    },
    {
      chapter: 3,
      concept: t("notes.c3.concept"),
      whatHappened: t("notes.c3.what_happened"),
      grownUp: t("notes.c3.grown_up"),
      questions: [t("notes.c3.q1"), t("notes.c3.q2"), t("notes.c3.q3")],
    },
  ];
});
