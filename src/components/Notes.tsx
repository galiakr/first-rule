"use client";

import { useState } from "react";

import { useT } from "@/content/language";
import type { ChapterNote } from "@/content/notes";

interface Props {
  notes: ChapterNote[];
  /** Chapter titles, in order, so a locked note still has a name to show. */
  titles: string[];
  /** 1-based chapter numbers whose notes have been earned (chapter finished). */
  unlocked: number[];
  open: boolean;
  onClose: () => void;
}

/**
 * The notebook. Same drawer shape as the rule book, but it holds the *ideas*
 * rather than the rules — one entry per chapter, readable only after that
 * chapter is done (§2: felt first, named afterwards).
 *
 * The chapters are an accordion: everything starts collapsed, so the notebook
 * opens as a short list of what has been earned rather than a wall of text,
 * and only one chapter is ever open at a time. Closing the drawer resets it,
 * the same way the table of contents drops its selection.
 *
 * Like the table of contents, this never re-enters the game's phase machine:
 * nothing here changes state, and a locked chapter isn't a button at all.
 */
export default function Notes({
  notes,
  titles,
  unlocked,
  open,
  onClose,
}: Props) {
  const t = useT();
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!open) return null;

  const anyUnlocked = notes.some((n) => unlocked.includes(n.chapter));

  function close() {
    setExpanded(null);
    onClose();
  }

  /** One open at a time — picking another chapter collapses the first. */
  function toggle(chapter: number) {
    setExpanded((current) => (current === chapter ? null : chapter));
  }

  return (
    <div
      className="fixed inset-0 z-20 flex"
      role="dialog"
      aria-label={t("notes.heading")}
    >
      <button
        type="button"
        aria-label={t("notes.close_aria")}
        onClick={close}
        className="flex-1 bg-night/70"
      />
      <div className="settle w-full max-w-md overflow-y-auto bg-paper p-6 text-ink shadow-2xl sm:p-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-book text-2xl">{t("notes.heading")}</h2>
          <button
            type="button"
            onClick={close}
            className="text-sm text-ink/60 underline underline-offset-4"
          >
            {t("common.close")}
          </button>
        </div>

        <p className="mb-8 text-sm leading-relaxed text-ink/60">
          {t("notes.intro")}
        </p>

        {!anyUnlocked ? (
          <p className="font-book text-lg leading-relaxed text-ink/60">
            {t("notes.empty")}
          </p>
        ) : null}

        <ol className="space-y-1">
          {notes.map((note) => {
            const title = titles[note.chapter - 1] ?? "";
            const number = t("toc.chapter_number", { n: note.chapter });

            if (!unlocked.includes(note.chapter)) {
              return (
                <li
                  key={note.chapter}
                  className="border-b border-ink/10 py-3 text-ink/35"
                >
                  <p className="text-xs font-ui">{number}</p>
                  <p className="font-book text-lg leading-relaxed">
                    {title}
                    <span className="ms-2 text-sm">{t("notes.locked")}</span>
                  </p>
                </li>
              );
            }

            const isOpen = expanded === note.chapter;
            const panelId = `note-panel-${note.chapter}`;

            return (
              <li key={note.chapter} className="border-b border-ink/15">
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(note.chapter)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-baseline justify-between gap-3 py-3 text-start hover:text-ink/70"
                  >
                    <span>
                      <span className="block text-xs font-ui text-ink/50">
                        {number}
                      </span>
                      <span className="font-book text-lg leading-relaxed">
                        {title}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-lg text-ink/40">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>

                {isOpen ? (
                  <div id={panelId} className="settle pb-6">
                    <h4 className="font-book text-xl leading-relaxed">
                      {note.concept}
                    </h4>

                    <p className="mt-3 leading-relaxed">{note.whatHappened}</p>

                    <h5 className="mt-5 text-sm font-ui text-ink/50">
                      {t("notes.grown_up_heading")}
                    </h5>
                    <p className="mt-1 leading-relaxed">{note.grownUp}</p>

                    <h5 className="mt-5 text-sm font-ui text-ink/50">
                      {t("notes.questions_heading")}
                    </h5>
                    <ul className="mt-2 space-y-2">
                      {note.questions.map((q) => (
                        <li
                          key={q}
                          className="border-s-2 border-lamp pe-2 ps-3 leading-relaxed"
                        >
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
