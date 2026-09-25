"use client";

import { useState } from "react";

import { useLanguage } from "@/content/language";
import { about, groupBlurb } from "@/content/village";
import { groupLabel } from "@/engine/options";
import { GROUPS } from "@/engine/rights";

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
  onContinue,
}: {
  onContinue: (villageName: string) => void;
}) {
  const { lang, t } = useLanguage();
  const [name, setName] = useState("");
  const copy = about(lang);
  const labels = groupLabel(lang);
  const blurbs = groupBlurb(lang);

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-book text-4xl leading-tight">{copy.title}</h1>
        <p className="text-lg leading-relaxed">{copy.villageText}</p>
      </header>

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

      <p className="border-s-2 border-lamp ps-1 pe-4 text-lg leading-relaxed">
        {copy.meText}
      </p>

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
    </section>
  );
}
