"use client";

import { useLanguage } from "@/content/language";
import { actors } from "@/content/village";
import { groupLabel } from "@/engine/options";

/**
 * A character's name, wherever it's mentioned in prose. Hover or focus shows
 * who they are — which group(s) they belong to, and whether they even live
 * in the village. Never inside a button (TOC list items, PrecedentChoice
 * labels) — a focusable span nested in a button is a real accessibility
 * problem, not a style choice, so titles stay plain text everywhere.
 */
export default function CharacterName({ actorId }: { actorId: string }) {
  const { lang, t } = useLanguage();
  const actor = actors(lang)[actorId];
  if (!actor) return null;

  const labels = groupLabel(lang);
  const groups = actor.groups.map((g) => labels[g]).join(", ");
  const info = actor.resident
    ? groups
    : `${groups} — ${t("character.non_resident")}`;

  return (
    <span className="group relative inline-block">
      <span
        tabIndex={0}
        aria-label={`${actor.name} — ${info}`}
        className="cursor-help border-b border-dotted border-quiet/70 outline-none focus-visible:border-lamp"
      >
        {actor.name}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full end-0 z-30 mb-1.5 hidden w-max max-w-[14rem] rounded-sm bg-night px-2.5 py-1.5 text-sm shadow-lg group-hover:block group-focus-within:block"
      >
        <span className="block font-book text-paper">{actor.name}</span>
        <span className="block text-quiet">{info}</span>
      </span>
    </span>
  );
}
