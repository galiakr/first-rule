"use client";

import { t } from "@/content/tokens";
import { ruleSentence } from "@/engine/match";
import { GROUP_LABEL } from "@/engine/options";
import { GROUPS, PROTECTION_LABEL, STATE_LABEL, harmed } from "@/engine/rights";
import type { GameState } from "@/engine/types";

/**
 * The only place the rights board is shown (§8, §10). Not a score — a list of
 * protections with the group they belong to, broken ones first.
 */
export default function ChapterEnd({
  state,
  onContinue,
}: {
  state: GameState;
  /** Present when there's a next chapter to move to; absent at the last built one. */
  onContinue?: () => void;
}) {
  const harm = harmed(state.rights);
  const harmedGroups = new Set(harm.map((h) => h.group));
  const untouched = GROUPS.filter((g) => !harmedGroups.has(g));

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-quiet">
          {t("chapter_end.subtitle", { chapter: state.chapter })}
        </p>
        <h2 className="font-book text-3xl leading-tight">
          {t("chapter_end.title")}
        </h2>
      </header>

      <section className="rounded-sm bg-paper p-6 text-ink">
        {state.rules.length === 0 ? (
          <p className="font-book text-lg leading-relaxed">
            {t("chapter_end.no_rules")}
          </p>
        ) : (
          <ol className="space-y-5">
            {state.rules.map((rule, i) => (
              <li
                key={rule.id}
                className="font-book text-[1.15rem] leading-relaxed"
              >
                <span className="ms-2 text-ink/45">{i + 1}.</span>
                {ruleSentence(rule)}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="font-book text-xl">
          {t("chapter_end.left_out_heading")}
        </h3>
        {harm.length === 0 ? (
          <p className="text-quiet">{t("chapter_end.no_harm")}</p>
        ) : (
          <ul className="space-y-2">
            {harm.map((h) => (
              <li
                key={`${h.protection}:${h.group}`}
                className="flex items-baseline gap-3 border-b border-moss pb-2"
              >
                <span
                  className={`text-sm ${
                    h.state === "broken" ? "text-harm" : "text-lamp"
                  }`}
                >
                  {STATE_LABEL[h.state]}
                </span>
                <span className="font-book text-lg">
                  {t("chapter_end.protection_prefix", {
                    protection: PROTECTION_LABEL[h.protection],
                  })}
                </span>
                <span className="text-quiet">
                  {t("chapter_end.group_prefix", {
                    group: GROUP_LABEL[h.group],
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {untouched.length > 0 ? (
        <section className="space-y-2">
          <h3 className="font-book text-xl">
            {t("chapter_end.protected_heading")}
          </h3>
          <p className="text-quiet">
            {t("chapter_end.protected_text", {
              groups: untouched.map((g) => GROUP_LABEL[g]).join(", "),
            })}
          </p>
        </section>
      ) : null}

      {onContinue ? (
        <div className="border-t border-moss pt-6">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-sm bg-lamp px-5 py-2.5 text-night"
          >
            {t("chapter_end.continue")}
          </button>
        </div>
      ) : (
        <p className="max-w-read border-t border-moss pt-6 text-quiet">
          {t("chapter_end.closing_note")}
        </p>
      )}
    </div>
  );
}
