"use client";

import { useState } from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/content/language";
import { groupBlurb } from "@/content/village";
import { fill, groupLabel, whatOptions, whoOptions } from "@/engine/options";
import { GROUPS } from "@/engine/rights";
import type { SavedGame } from "@/engine/save";
import type { GroupId, WhoScope } from "@/engine/types";

/**
 * The way in.
 *
 * The game's real idea is that a rule lands on people, so the hero is the six
 * villagers rather than a headline about the game: as the child picks who the
 * rule applies to, the groups it reaches light up and the ones it misses go
 * grey. A child sees in two seconds that what they write has a near side and
 * a far side.
 *
 * It runs on the real engine — `whoOptions`, `whatOptions` and `fill` are the
 * same tables and the same assembler the rule builder uses inside — so the
 * taste can't drift out of step with the game.
 *
 * Deliberately a different world from the game it opens onto: daylight rather
 * than dusk, and the six group colours as the palette. Colour here means
 * *who*, and appears nowhere else on the page.
 */

/** One colour per group, so colour carries identity rather than decoration. */
const GROUP_COLOR: Record<GroupId, string> = {
  "old-timers": "#C2410C",
  newcomers: "#0F9B8E",
  shepherds: "#5F7F33",
  builders: "#D98806",
  children: "#D6146A",
  "passers-through": "#6C4BD8",
};

/**
 * Whether a rule with this scope reaches a group — the engine's own rule,
 * and the reason the village reacts. `whoCovers` works on a person, so this
 * is the same question asked of a whole group.
 */
function scopeReaches(scope: WhoScope, group: GroupId): boolean {
  switch (scope) {
    case "residents":
      // The passers-through are the one group that doesn't live here (§4).
      return group !== "passers-through";
    case "anyone-present":
      return true;
    // Neither of these is offered on this screen (see DEMO_SCOPES); they are
    // here because the scope type is closed and the switch has to be total.
    case "group":
      return group === "children";
    case "everyone-except":
      return group !== "children";
  }
}

/**
 * Only the two scopes that read on their own. The other two end in "a
 * particular group" and "everyone except —", which are questions rather than
 * answers; asking them before the game has started would be one question too
 * many, and the pair below already shows the reaction clearly: five of six,
 * or all six.
 */
const DEMO_SCOPES: WhoScope[] = ["residents", "anyone-present"];

const DEMO_SUBJECT = "water" as const;

export default function EntryScreen({
  saved,
  onResume,
  onDiscard,
  onContinue,
}: {
  saved: SavedGame | null;
  onResume: () => void;
  onDiscard: () => void;
  onContinue: (villageName: string) => void;
}) {
  const { lang, t } = useLanguage();
  const [name, setName] = useState("");
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [scope, setScope] = useState<WhoScope | null>(null);
  const [what, setWhat] = useState<string | null>(null);

  const labels = groupLabel(lang);
  const blurbs = groupBlurb(lang);

  const whoFragment = scope
    ? fill(
        whoOptions(lang).find((o) => o.value === scope)!.template,
        DEMO_SUBJECT,
        lang,
      )
    : null;
  const whatFragment = what
    ? fill(
        whatOptions(lang).find((o) => o.value === what)!.template,
        DEMO_SUBJECT,
        lang,
      )
    : null;

  const reached = scope ? GROUPS.filter((g) => scopeReaches(scope, g)) : [];

  return (
    <div className="min-h-screen bg-daylight text-inkdeep">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-inkdeep pb-2">
          <span className="font-display text-xl">{t("app.title")}</span>
          <LanguageSwitcher tone="light" />
        </header>

        {saved ? (
          <ResumeOffer
            saved={saved}
            confirming={confirmingDiscard}
            setConfirming={setConfirmingDiscard}
            onResume={onResume}
            onDiscard={onDiscard}
          />
        ) : (
          <>
            <h1 className="max-w-[18ch] font-display text-[clamp(2.1rem,1.5rem+3vw,4rem)] leading-[1.03] tracking-tight">
              {t("landing.headline")}
              <span className="block text-act">{t("landing.subhead")}</span>
            </h1>

            <p className="max-w-[46ch] text-lg leading-relaxed text-inksoft">
              {t("landing.prompt")}
            </p>

            {/* The builder. Two fields is enough to produce a real sentence
                and to make the village react; the remaining two are inside. */}
            <section className="flex flex-col gap-4">
              <Field
                legend={t("builder.legend_who")}
                options={whoOptions(lang)
                  .filter((o) => DEMO_SCOPES.includes(o.value))
                  .map((o) => ({ value: o.value, label: o.label }))}
                picked={scope}
                onPick={(v) => setScope(v as WhoScope)}
              />
              <Field
                legend={t("builder.legend_what")}
                options={whatOptions(lang).map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                picked={what}
                onPick={setWhat}
              />
            </section>

            <p className="text-[0.95rem] font-semibold text-inkdeep">
              {scope
                ? t("landing.tally", {
                    reached: reached.length,
                    total: GROUPS.length,
                  })
                : t("landing.tally_empty")}
            </p>

            {/* The village. This is the hero: the rule is abstract until you
                can see who is standing on the other side of it. */}
            <section
              aria-label={t("landing.who_it_lands_on")}
              className="grid grid-cols-2 gap-2 lg:grid-cols-3"
            >
              {GROUPS.map((g) => {
                const hit = scope ? scopeReaches(scope, g) : null;
                return (
                  <article
                    key={g}
                    style={{ "--tint": GROUP_COLOR[g] } as React.CSSProperties}
                    data-reached={hit === null ? "" : hit ? "yes" : "no"}
                    className="group flex flex-col gap-1 rounded-[2px_14px_2px_14px] border-2 bg-daylight2 px-3 py-2.5 sm:px-4 sm:py-3 transition data-[reached=no]:translate-y-[2px] data-[reached=no]:border-hairline data-[reached=no]:opacity-40"
                    // The tint is the group's identity; a missed group loses it.
                  >
                    <span className="font-display text-lg leading-tight text-[var(--tint)] group-data-[reached=no]:text-inksoft">
                      {labels[g]}
                    </span>
                    <span className="hidden text-sm leading-snug text-inksoft sm:block">
                      {blurbs[g]}
                    </span>
                    {hit !== null ? (
                      <span className="text-sm font-semibold text-[var(--tint)] group-data-[reached=no]:text-inksoft">
                        {hit ? t("landing.reaches") : t("landing.misses")}
                      </span>
                    ) : null}
                  </article>
                );
              })}
            </section>

            {/* The decree: the one place the page raises its voice. */}
            <section className="rounded-sm border-2 border-inkdeep bg-daylight2 p-5 shadow-[10px_10px_0_-2px_#161A3A] sm:p-6">
              <p className="mb-2 text-sm tracking-wide text-inksoft">
                {t("landing.book_label")}
              </p>
              <p className="font-display text-[clamp(1.1rem,0.95rem+0.9vw,1.6rem)] leading-snug">
                {whoFragment ?? (
                  <span className="rule-slot text-inksoft">
                    {t("builder.blank_who")}
                  </span>
                )}{" "}
                {whatFragment ?? (
                  <span className="rule-slot text-inksoft">
                    {t("builder.blank_what")}
                  </span>
                )}
                …
              </p>
            </section>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="village-name"
                className="text-sm font-semibold text-inksoft"
              >
                {t("about.name_prompt")}
              </label>
              <input
                id="village-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("about.name_placeholder")}
                maxLength={30}
                className="w-full max-w-sm rounded-sm border-2 border-hairline bg-daylight2 px-4 py-2.5 font-display text-lg text-inkdeep placeholder:text-inksoft focus:border-inkdeep focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  onContinue(name.trim() || t("about.name_placeholder"))
                }
                className="rounded-full bg-act px-7 py-3 font-display text-lg text-white shadow-[0_5px_0_0_#C81E3A] transition hover:translate-y-[2px] hover:shadow-[0_3px_0_0_#C81E3A]"
              >
                {t("about.enter_village")}
              </button>
              <span className="max-w-[32ch] text-sm text-inksoft">
                {t("save.note")}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  legend,
  options,
  picked,
  onPick,
}: {
  legend: string;
  options: { value: string; label: string }[];
  picked: string | null;
  onPick: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-wrap items-baseline gap-2">
      <legend className="mb-1 text-sm font-semibold text-inksoft">
        {legend}
      </legend>
      {options.map((o) => {
        const on = picked === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onPick(o.value)}
            aria-pressed={on}
            className={`rounded-full border-2 px-4 py-2 text-[0.95rem] transition ${
              on
                ? "border-inkdeep bg-inkdeep text-daylight2"
                : "border-hairline bg-daylight2 text-inkdeep hover:border-inksoft"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </fieldset>
  );
}

/** A half-played village is offered before the child is asked to name another. */
function ResumeOffer({
  saved,
  confirming,
  setConfirming,
  onResume,
  onDiscard,
}: {
  saved: SavedGame;
  confirming: boolean;
  setConfirming: (v: boolean) => void;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-[clamp(1.9rem,1.4rem+2vw,3rem)] leading-tight">
        {t("save.resume_heading")}
      </h1>
      <p className="text-lg leading-relaxed text-inksoft">
        {t("save.resume_line", {
          village: saved.villageName,
          chapter: saved.state.chapter,
        })}
      </p>

      {confirming ? (
        <div className="flex flex-col gap-3 border-s-4 border-act ps-4">
          <p className="text-lg leading-relaxed">{t("save.restart_confirm")}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onDiscard}
              className="rounded-full border-2 border-act px-5 py-2 text-act"
            >
              {t("save.restart_yes")}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full bg-inkdeep px-5 py-2 text-daylight2"
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
            className="rounded-full bg-act px-7 py-3 font-display text-lg text-white shadow-[0_5px_0_0_#C81E3A]"
          >
            {t("save.resume")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-full border-2 border-hairline px-5 py-2 text-inkdeep hover:border-inksoft"
          >
            {t("save.restart")}
          </button>
        </div>
      )}
    </section>
  );
}
