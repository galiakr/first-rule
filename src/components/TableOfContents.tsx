"use client";

import { useState } from "react";

import LinkedText from "@/components/LinkedText";
import { t } from "@/content/tokens";
import {
  ABOUT_ME_TEXT,
  ABOUT_TITLE,
  ABOUT_VILLAGE_TEXT,
  GROUP_BLURB,
} from "@/content/village";
import { GROUP_LABEL } from "@/engine/options";
import { GROUPS } from "@/engine/rights";
import type { Situation } from "@/engine/types";

export interface ChapterEntry {
  title: string;
  intro: string;
  situations: Situation[];
  /** How many of this chapter's situations have already been read (0 = none yet). */
  readCount: number;
}

type Entry =
  | { key: "about" }
  | { key: "intro"; chapterIndex: number }
  | { key: "situation"; id: string };

function findSituation(chapters: ChapterEntry[], id: string) {
  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const situationIndex = chapters[chapterIndex].situations.findIndex(
      (s) => s.id === id,
    );
    if (situationIndex !== -1) {
      return {
        chapterIndex,
        situationIndex,
        situation: chapters[chapterIndex].situations[situationIndex],
      };
    }
  }
  return null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  chapters: ChapterEntry[];
}

/**
 * A read-only way back into what already happened. It never re-enters the
 * game's own phase machine — no cursor moves, no rule can be rewritten here.
 * It exists only so a scene, once read, isn't gone.
 */
export default function TableOfContents({ open, onClose, chapters }: Props) {
  const [selected, setSelected] = useState<Entry | null>(null);

  if (!open) return null;

  function close() {
    setSelected(null);
    onClose();
  }

  const situationLocation =
    selected?.key === "situation" ? findSituation(chapters, selected.id) : null;

  return (
    <div
      className="fixed inset-0 z-20 flex"
      role="dialog"
      aria-label={t("app.toc_button")}
    >
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={close}
        className="flex-1 bg-night/70"
      />
      <div className="settle w-full max-w-md overflow-y-auto bg-paper p-6 text-ink shadow-2xl sm:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-book text-2xl">{t("app.toc_button")}</h2>
          <button
            type="button"
            onClick={close}
            className="text-sm text-ink/60 underline underline-offset-4"
          >
            {t("common.close")}
          </button>
        </div>

        {selected === null ? (
          <nav>
            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => setSelected({ key: "about" })}
                  className="block w-full rounded-sm p-3 text-right font-book text-lg leading-relaxed hover:bg-white"
                >
                  {ABOUT_TITLE}
                </button>
              </li>
              {chapters.map((chapter, chapterIndex) => (
                <li key={chapterIndex}>
                  <ul className="space-y-3">
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setSelected({ key: "intro", chapterIndex })
                        }
                        className="block w-full rounded-sm p-3 text-right font-book text-lg leading-relaxed hover:bg-white"
                      >
                        <span className="block text-xs font-ui text-ink/50">
                          {t("toc.chapter_number", { n: chapterIndex + 1 })}
                        </span>
                        {chapter.title}
                      </button>
                    </li>
                    {chapter.situations.map((s, i) => {
                      const read = i < chapter.readCount;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            disabled={!read}
                            onClick={() =>
                              setSelected({ key: "situation", id: s.id })
                            }
                            className={
                              read
                                ? "block w-full rounded-sm p-3 text-right font-book text-lg leading-relaxed hover:bg-white"
                                : "block w-full rounded-sm p-3 text-right font-book text-lg leading-relaxed text-ink/35"
                            }
                          >
                            <span className="block text-xs font-ui text-ink/40">
                              {t("toc.situation_number", { n: i + 1 })}
                            </span>
                            {s.title}
                            {!read ? (
                              <span className="ms-2 text-sm text-ink/40">
                                {t("toc.not_reached")}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm text-ink/60 underline underline-offset-4"
            >
              {t("common.back_to_list")}
            </button>

            {selected.key === "about" ? (
              <div className="space-y-5">
                <h3 className="font-book text-xl">{ABOUT_TITLE}</h3>
                <p className="leading-relaxed">{ABOUT_VILLAGE_TEXT}</p>
                <ul className="space-y-2">
                  {GROUPS.map((g) => (
                    <li key={g} className="border-b border-ink/15 pb-2">
                      <span className="font-book">{GROUP_LABEL[g]}</span>
                      <span className="text-ink/60"> — {GROUP_BLURB[g]}</span>
                    </li>
                  ))}
                </ul>
                <p className="leading-relaxed">{ABOUT_ME_TEXT}</p>
              </div>
            ) : null}

            {selected.key === "intro" ? (
              <div className="space-y-4">
                <p className="text-sm text-ink/50">
                  {t("toc.chapter_number", { n: selected.chapterIndex + 1 })}
                </p>
                <h3 className="font-book text-xl">
                  {chapters[selected.chapterIndex].title}
                </h3>
                <p className="leading-relaxed">
                  {chapters[selected.chapterIndex].intro}
                </p>
              </div>
            ) : null}

            {situationLocation ? (
              <div className="space-y-4">
                <p className="text-sm text-ink/50">
                  {t("toc.chapter_number", {
                    n: situationLocation.chapterIndex + 1,
                  })}{" "}
                  ·{" "}
                  {t("toc.situation_number", {
                    n: situationLocation.situationIndex + 1,
                  })}
                </p>
                <h3 className="font-book text-xl">
                  {situationLocation.situation.title}
                </h3>
                <p className="leading-relaxed">
                  <LinkedText text={situationLocation.situation.text} />
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
