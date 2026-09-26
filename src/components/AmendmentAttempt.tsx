"use client";

import { useState } from "react";

import RuleBuilder from "@/components/RuleBuilder";
import { useLanguage } from "@/content/language";
import { ruleSentence } from "@/engine/match";
import { amendmentOptions, findOption } from "@/engine/options";
import type { AmendmentForm, Rule } from "@/engine/types";

/**
 * The child's one attempt at changing a rule (§9.7).
 *
 * The screen shows three things in order: the rule as it stands, the line
 * they wrote two chapters ago about how a rule may be changed, and then the
 * builder. Putting the amendment rule in front of them *before* they try is
 * the whole point — they are about to find out what they promised their
 * future self, and the game should not spring it after the fact.
 *
 * Nothing here says whether the attempt will work. That is the amendment
 * rule's business, and it is answered in the outcome.
 */
export default function AmendmentAttempt({
  rule,
  amendment,
  onAttempt,
  onLeave,
}: {
  /** The rule the child is trying to change; null when the book is empty. */
  rule: Rule | null;
  amendment: AmendmentForm | null;
  onAttempt: (next: Rule) => void;
  onLeave: () => void;
}) {
  const { lang, t } = useLanguage();
  const [building, setBuilding] = useState(false);

  if (!rule) {
    return (
      <div className="space-y-6">
        <p className="text-lg leading-relaxed">{t("amend.empty_book")}</p>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-sm bg-lamp px-5 py-2.5 text-night"
        >
          {t("app.decide.continue")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed">{t("amend.intro")}</p>

      <div className="rounded-sm bg-paper p-5 font-book text-[1.15rem] leading-relaxed text-ink">
        {ruleSentence(rule, lang)}
      </div>

      {amendment ? (
        <div>
          <p className="text-sm text-quiet">{t("amend.rule_says")}</p>
          <p className="mt-1 border-s-2 border-lamp pe-4 ps-3 font-book text-[1.1rem] leading-relaxed">
            {findOption(amendmentOptions(lang), amendment).template}
          </p>
        </div>
      ) : null}

      {building ? (
        <RuleBuilder
          subject={rule.subject}
          situationId={rule.writtenAt}
          // The rule being rewritten is not in the comparison set; it would
          // otherwise flag itself as contradicting itself.
          existingRules={[]}
          onWrite={onAttempt}
          onSkip={onLeave}
        />
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setBuilding(true)}
            className="rounded-sm bg-lamp px-5 py-2.5 text-night"
          >
            {t("amend.start")}
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-sm border border-moss px-5 py-2.5 text-paper hover:bg-dusk"
          >
            {t("amend.leave")}
          </button>
        </div>
      )}
    </div>
  );
}
