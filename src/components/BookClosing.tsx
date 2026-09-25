"use client";

import { useState } from "react";

import RuleBuilder from "@/components/RuleBuilder";
import { useLanguage } from "@/content/language";
import { ruleSentence } from "@/engine/match";
import { amendmentOptions } from "@/engine/options";
import type { AmendmentForm, Rule } from "@/engine/types";

type Step = "read" | "change" | "rewrite" | "amendment";

/**
 * The book closes (§10).
 *
 * The village reads the rules aloud, the child may change exactly one, and
 * then writes one last rule: how a rule may be changed at all.
 *
 * That last rule is written behind a veil, and the veil is the point — the
 * doc is explicit that the child writes it before knowing that in chapter 7
 * they are the one who will want to change something. So nothing in this
 * component may hint at that. The copy talks about rules in general, never
 * about a rule that might one day hurt.
 */
export default function BookClosing({
  rules,
  onReplace,
  onClose,
}: {
  rules: Rule[];
  onReplace: (ruleId: string, next: Rule) => void;
  onClose: (amendment: AmendmentForm) => void;
}) {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState<Step>("read");
  const [editing, setEditing] = useState<Rule | null>(null);
  const [changed, setChanged] = useState<boolean | null>(null);
  const [amendment, setAmendment] = useState<AmendmentForm | null>(null);

  function finishChange(replacement: Rule | null) {
    if (editing && replacement) {
      onReplace(editing.id, replacement);
      setChanged(true);
    } else {
      setChanged(false);
    }
    setEditing(null);
    setStep("amendment");
  }

  return (
    <section className="settle space-y-8">
      <header className="space-y-3">
        <h2 className="font-book text-3xl leading-tight">
          {t("closing.heading")}
        </h2>
        <p className="text-lg leading-relaxed">{t("closing.intro")}</p>
      </header>

      {/* The book, read aloud. */}
      <div className="rounded-sm bg-paper p-6 text-ink">
        {rules.length === 0 ? (
          <p className="font-book text-lg leading-relaxed">
            {t("closing.empty")}
          </p>
        ) : (
          <ol className="space-y-5">
            {rules.map((rule, i) => (
              <li
                key={rule.id}
                className="font-book text-[1.15rem] leading-relaxed"
              >
                <span className="me-2 text-ink/45">{i + 1}.</span>
                {ruleSentence(rule, lang)}
              </li>
            ))}
          </ol>
        )}
      </div>

      {step === "read" ? (
        <button
          type="button"
          onClick={() => setStep(rules.length > 0 ? "change" : "amendment")}
          className="rounded-sm bg-lamp px-5 py-2.5 text-night"
        >
          {t("app.outcome.continue")}
        </button>
      ) : null}

      {/* One rule may be changed. One only. */}
      {step === "change" ? (
        <div className="settle space-y-4 border-t border-moss pt-6">
          <h3 className="font-book text-xl">{t("closing.change_heading")}</h3>
          <p className="leading-relaxed">{t("closing.change_intro")}</p>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-sm bg-paper p-4 text-ink">
                <p className="font-book text-[1.05rem] leading-relaxed">
                  {ruleSentence(rule, lang)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(rule);
                    setStep("rewrite");
                  }}
                  className="mt-2 text-sm text-ink/60 underline underline-offset-4"
                >
                  {t("closing.change_pick")}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => finishChange(null)}
            className="rounded-sm border border-moss px-5 py-2.5 text-paper hover:bg-dusk"
          >
            {t("closing.change_skip")}
          </button>
        </div>
      ) : null}

      {step === "rewrite" && editing ? (
        <div className="settle space-y-4 border-t border-moss pt-6">
          <h3 className="font-book text-xl">{t("closing.change_heading")}</h3>
          <RuleBuilder
            subject={editing.subject}
            situationId={editing.writtenAt}
            // The rule being rewritten is not in the comparison set: it would
            // otherwise flag itself as a contradiction of itself.
            existingRules={rules.filter((r) => r.id !== editing.id)}
            onWrite={(next) => finishChange(next)}
            onSkip={() => finishChange(null)}
          />
        </div>
      ) : null}

      {/* And one last rule, written without knowing who it will serve. */}
      {step === "amendment" ? (
        <div className="settle space-y-4 border-t border-moss pt-6">
          {changed !== null ? (
            <p className="text-sm text-lamp">
              ✓ {changed ? t("closing.changed") : t("closing.unchanged")}
            </p>
          ) : null}

          <h3 className="font-book text-xl">
            {t("closing.amendment_heading")}
          </h3>
          <p className="text-lg leading-relaxed">
            {t("closing.amendment_intro")}
          </p>

          <div className="flex flex-wrap gap-2">
            {amendmentOptions(lang).map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setAmendment(o.value)}
                aria-pressed={o.value === amendment}
                className={`rounded-sm px-3 py-2 text-start text-[0.95rem] transition-colors ${
                  o.value === amendment
                    ? "bg-lamp text-night"
                    : "bg-dusk text-paper hover:bg-moss"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {amendment ? (
            <button
              type="button"
              onClick={() => onClose(amendment)}
              className="rounded-sm bg-lamp px-5 py-2.5 text-night"
            >
              {t("closing.seal")}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
