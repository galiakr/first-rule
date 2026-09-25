"use client";

import { useState } from "react";

import { useLanguage } from "@/content/language";
import { groupLabel } from "@/engine/options";
import { GROUPS } from "@/engine/rights";
import { JOBS } from "@/engine/separation";
import type { Actor, Holder, Job, Separation } from "@/engine/types";

/**
 * The village staffs the three jobs (§9.6).
 *
 * Staffing is the village's act, not the decider's: appointing who guards the
 * book is constitutional, not day-to-day, so a child who lost chapter 5's
 * election still assigns here. They get an extra line saying why, rather than
 * being quietly handed a power the rest of the game just took away.
 */
function holderKey(holder: Holder): string {
  switch (holder.kind) {
    case "you":
      return "you";
    case "village":
      return "village";
    case "actor":
      return `actor:${holder.actorId}`;
    case "group":
      return `group:${holder.groupId}`;
  }
}

export default function SeparationBuilder({
  actors,
  showLostNote,
  onConfirm,
}: {
  actors: Record<string, Actor>;
  /** True when the child lost chapter 5's election — explains why they still assign. */
  showLostNote: boolean;
  onConfirm: (separation: Separation) => void;
}) {
  const { lang, t } = useLanguage();
  const labels = groupLabel(lang);

  const [picked, setPicked] = useState<Partial<Record<Job, Holder>>>({});

  const options: { holder: Holder; label: string }[] = [
    { holder: { kind: "you" }, label: t("staffing.you") },
    ...Object.values(actors).map((a) => ({
      holder: { kind: "actor" as const, actorId: a.id },
      label: a.name,
    })),
    ...GROUPS.map((g) => ({
      holder: { kind: "group" as const, groupId: g },
      label: labels[g],
    })),
    { holder: { kind: "village" }, label: t("staffing.village") },
  ];

  const complete = JOBS.every((job) => picked[job]);

  return (
    <section className="settle space-y-8">
      <header className="space-y-3">
        <h2 className="font-book text-3xl leading-tight">
          {t("staffing.heading")}
        </h2>
        <p className="text-lg leading-relaxed">{t("staffing.intro")}</p>
        {showLostNote ? (
          <p className="border-s-2 border-lamp pe-4 ps-3 leading-relaxed text-quiet">
            {t("staffing.lost_note")}
          </p>
        ) : null}
      </header>

      {JOBS.map((job) => (
        <fieldset key={job} className="border-t border-moss pt-3">
          <legend className="px-2 text-sm text-quiet">
            {t(`staffing.${job}_legend`)}
          </legend>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const key = holderKey(option.holder);
              const isPicked = picked[job] && holderKey(picked[job]) === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setPicked((p) => ({ ...p, [job]: option.holder }))
                  }
                  aria-pressed={Boolean(isPicked)}
                  className={`rounded-sm px-3 py-2 text-start text-[0.95rem] transition-colors ${
                    isPicked
                      ? "bg-lamp text-night"
                      : "bg-dusk text-paper hover:bg-moss"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {complete ? (
        <button
          type="button"
          onClick={() => onConfirm(picked as Separation)}
          className="rounded-sm bg-lamp px-5 py-2.5 text-night"
        >
          {t("staffing.confirm")}
        </button>
      ) : null}
    </section>
  );
}
