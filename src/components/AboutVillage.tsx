"use client";

import { useState } from "react";

import RuleTaste from "@/components/RuleTaste";
import { useLanguage } from "@/content/language";
import { about, groupBlurb } from "@/content/village";
import { groupLabel } from "@/engine/options";
import { GROUPS } from "@/engine/rights";
import type { SavedGame } from "@/engine/save";

/**
 * The screen before the village opens (§4). Introduces the six groups by
 * what moves them, then says what the child's role is not: appointed by
 * anyone. This is scene-setting, not a lesson — so unlike the concepts in
 * play, it can be said outright before anything is felt.
 *
 * Naming the village is the one place in the whole game with a free-text
 * field — it's never read by the engine, only displayed, so it doesn't touch
 * the "no free text, no language model" rule that governs rule-writing (§11).
 */
export default function AboutVillage({
  saved,
  onResume,
  onDiscard,
  onContinue,
}: {
  /** A village left half-played, if there is one. */
  saved: SavedGame | null;
  onResume: () => void;
  onDiscard: () => void;
  onContinue: (villageName: string) => void;
}) {
  const { lang, t } = useLanguage();
  const [name, setName] = useState("");
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [wroteOne, setWroteOne] = useState(false);
  const copy = about(lang);
  const labels = groupLabel(lang);
  const blurbs = groupBlurb(lang);

  // A half-played village takes over the screen: the child is offered the
  // one they already have before being asked to name another. Throwing it
  // away is irreversible, so it is confirmed once, plainly.
  if (saved) {
    return (
      <section className="space-y-8">
        <header className="space-y-3">
          <h1 className="font-book text-4xl leading-tight">
            {t("save.resume_heading")}
          </h1>
          <p className="text-lg leading-relaxed">
            {t("save.resume_line", {
              village: saved.villageName,
              chapter: saved.state.chapter,
            })}
          </p>
        </header>

        {confirmingDiscard ? (
          <div className="settle space-y-4 border-s-2 border-harm ps-3 pe-4">
            <p className="text-lg leading-relaxed">
              {t("save.restart_confirm")}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onDiscard}
                className="rounded-sm border border-harm px-5 py-2.5 text-paper hover:bg-dusk"
              >
                {t("save.restart_yes")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDiscard(false)}
                className="rounded-sm bg-lamp px-5 py-2.5 text-night"
              >
                {t("save.restart_no")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onResume}
              className="rounded-sm bg-lamp px-5 py-2.5 text-night"
            >
              {t("save.resume")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDiscard(true)}
              className="rounded-sm border border-moss px-5 py-2.5 text-paper hover:bg-dusk"
            >
              {t("save.restart")}
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-12">
      {/* States the situation and hands over a tool. It does not describe the
          game — the builder underneath demonstrates it, which is a far better
          argument than any sentence about what the game is. */}
      <header>
        <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          {t("landing.headline")}
          <span className="mt-1 block text-blaze">{t("landing.subhead")}</span>
        </h1>
      </header>

      <RuleTaste onComplete={() => setWroteOne(true)} />

      {/* Everything below is a consequence of having written one, so it waits
          until there is one rather than competing with the builder. */}
      <div
        className={`space-y-8 border-t border-moss pt-10 transition-opacity duration-700 ${
          wroteOne ? "opacity-100" : "opacity-40"
        }`}
      >
        <p className="text-lg leading-relaxed">
          {t("landing.who_it_lands_on")}
        </p>

        <ul className="space-y-2">
          {GROUPS.map((g) => (
            <li
              key={g}
              className="flex flex-wrap items-baseline gap-x-3 border-b border-moss pb-2"
            >
              <span className="font-book text-lg">{labels[g]}</span>
              <span className="text-quiet">— {blurbs[g]}</span>
            </li>
          ))}
        </ul>

        <p className="border-s-2 border-lamp ps-3 pe-4 text-lg leading-relaxed">
          {copy.meText}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="village-name" className="block text-sm text-quiet">
          {t("about.name_prompt")}
        </label>
        <input
          id="village-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("about.name_placeholder")}
          maxLength={30}
          className="w-full rounded-sm border border-moss bg-dusk px-4 py-2.5 font-book text-lg text-paper placeholder:text-quiet focus:border-lamp focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={() => onContinue(name.trim() || t("about.name_placeholder"))}
        className="rounded-sm bg-lamp px-5 py-2.5 text-night"
      >
        {t("about.enter_village")}
      </button>

      <p className="text-sm text-quiet">{t("save.note")}</p>
    </section>
  );
}
