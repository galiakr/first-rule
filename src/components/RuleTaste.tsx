"use client";

import { useState } from "react";

import { useLanguage } from "@/content/language";
import {
  consequenceOptions,
  fill,
  whatOptions,
  whenOptions,
  whoOptions,
} from "@/engine/options";
import { translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";

/**
 * A law, written before the child has entered the village.
 *
 * The entry screen's whole job is to make an eight-year-old want to start, and
 * the most tempting thing this game has is not a description of itself — it is
 * the moment four taps turn into a sentence in a book. So the builder is the
 * hero, and it runs on the real engine: the same option tables, the same
 * `fill`, the same assembled sentence they will see inside. Nothing here is a
 * mock-up, which is why it can't drift out of step with the game.
 *
 * The subject is water, because water is what the first situation is about.
 */
const DEMO_SUBJECT = "water" as const;

type Field = "who" | "what" | "when" | "consequence";

export default function RuleTaste({ onComplete }: { onComplete: () => void }) {
  const { lang, t } = useLanguage();
  const [picked, setPicked] = useState<Partial<Record<Field, string>>>({});

  const rows: {
    field: Field;
    legend: string;
    options: { value: string; label: string; template: string }[];
  }[] = [
    {
      field: "who",
      legend: t("builder.legend_who"),
      options: whoOptions(lang),
    },
    {
      field: "what",
      legend: t("builder.legend_what"),
      options: whatOptions(lang),
    },
    {
      field: "when",
      legend: t("builder.legend_when"),
      options: whenOptions(lang),
    },
    {
      field: "consequence",
      legend: t("builder.legend_consequence"),
      options: consequenceOptions(lang),
    },
  ];

  const fragment = (field: Field): string | null => {
    const value = picked[field];
    if (!value) return null;
    const option = rows
      .find((r) => r.field === field)!
      .options.find((o) => o.value === value)!;
    // A group-scoped pick would need a group chosen too; the demo keeps to
    // the three scopes that read on their own.
    return fill(option.template, DEMO_SUBJECT, lang);
  };

  const complete = rows.every((r) => picked[r.field]);
  const blanks: Record<Field, string> = {
    who: t("builder.blank_who"),
    what: t("builder.blank_what"),
    when: t("builder.blank_when"),
    // The connector before it already says "if not" — repeating it here
    // made the empty sentence read "אם לא — ואם לא".
    consequence: "\u2026",
  };

  // The game's own sentence format, cut at the four slots.
  const SENTINEL = "\u0000";
  const sentence: { text?: string; field?: Field }[] = (() => {
    const order: Field[] = ["who", "what", "when", "consequence"];
    const raw = translator(lang as Lang)("rule.sentence", {
      who: SENTINEL,
      what: SENTINEL,
      when: SENTINEL,
      consequence: SENTINEL,
    });
    return raw
      .split(SENTINEL)
      .flatMap((text, i) =>
        i < order.length ? [{ text }, { field: order[i] }] : [{ text }],
      )
      .filter((part) => part.field || part.text);
  })();

  function pick(field: Field, value: string) {
    const next = { ...picked, [field]: value };
    setPicked(next);
    if (rows.every((r) => next[r.field])) onComplete();
  }

  return (
    <div className="space-y-8">
      <p className="text-lg leading-relaxed text-paper/75">
        {t("landing.prompt")}
      </p>

      {/* The book. Paper against the dark, so what the child made reads as
          written rather than typed.

          The sentence is assembled by the same `rule.sentence` token the game
          uses, with sentinels standing in for the four fragments, so the
          punctuation can't drift from the real thing. Hand-rolling the commas
          here is what produced "תמיד, אם לא —יצטרך" on the first attempt. */}
      <div className="rounded-lg bg-paper p-6 text-ink shadow-[0_20px_60px_-24px_rgba(0,0,0,0.9)] sm:p-7">
        <p className="mb-2 text-xs text-ink/45">{t("landing.book_label")}</p>
        <p className="font-book text-[1.25rem] leading-relaxed sm:text-[1.45rem]">
          {sentence.map((part, i) =>
            part.field ? (
              <span
                key={i}
                className={
                  picked[part.field] ? undefined : "rule-slot text-ink/30"
                }
              >
                {fragment(part.field) ?? blanks[part.field]}
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
      </div>

      <div className="space-y-5">
        {rows.map((row) => (
          <fieldset key={row.field}>
            <legend className="mb-2 text-sm text-quiet">{row.legend}</legend>
            <div className="flex flex-wrap gap-2">
              {row.options
                // "a particular group" needs a second question; out of place
                // in a four-tap taste of the thing.
                .filter(
                  (o) => o.value !== "group" && o.value !== "everyone-except",
                )
                .map((o) => {
                  const on = picked[row.field] === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => pick(row.field, o.value)}
                      aria-pressed={on}
                      className={`rounded-full px-4 py-2 text-[0.95rem] font-medium transition ${
                        on
                          ? "bg-blaze text-deepnight shadow-[0_0_24px_-4px_rgba(255,180,61,0.7)]"
                          : "bg-moss/60 text-paper hover:bg-moss"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
            </div>
          </fieldset>
        ))}
      </div>

      {complete ? (
        <p className="settle text-lg leading-relaxed text-blaze">
          {t("landing.made_it")}
        </p>
      ) : null}
    </div>
  );
}
