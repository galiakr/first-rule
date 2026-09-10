"use client";

import { t } from "@/content/tokens";
import { ruleSentence } from "@/engine/match";
import type { Rule } from "@/engine/types";

interface Props {
  rules: Rule[];
  open: boolean;
  onClose: () => void;
}

/**
 * The book is open the whole game (§10). It shows rules and, later, precedents.
 * It never shows who was harmed — that waits for the end of the chapter.
 */
export default function RuleBook({ rules, open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex"
      role="dialog"
      aria-label={t("app.rulebook_button")}
    >
      <button
        type="button"
        aria-label={t("rulebook.close_aria")}
        onClick={onClose}
        className="flex-1 bg-night/70"
      />
      <div className="settle w-full max-w-md overflow-y-auto bg-paper p-6 text-ink shadow-2xl sm:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-book text-2xl">{t("app.rulebook_button")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-ink/60 underline underline-offset-4"
          >
            {t("common.close")}
          </button>
        </div>

        {rules.length === 0 ? (
          <p className="font-book text-lg leading-relaxed text-ink/60">
            {t("rulebook.empty")}
          </p>
        ) : (
          <ol className="space-y-6">
            {rules.map((rule, i) => (
              <li key={rule.id}>
                <p className="mb-1 text-sm text-ink/50">
                  {t("rulebook.rule_number", { n: i + 1 })}
                </p>
                <p className="font-book text-[1.15rem] leading-relaxed">
                  {ruleSentence(rule)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
