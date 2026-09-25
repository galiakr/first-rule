"use client";

import { useMemo, useState } from "react";

import { useLanguage } from "@/content/language";
import { textualConflict } from "@/engine/conflict";
import { ruleSentence } from "@/engine/match";
import {
  consequenceOptions,
  groupLabel,
  subjectForms,
  whatOptions,
  whenOptions,
  whoOptions,
  fill,
  findOption,
} from "@/engine/options";
import { GROUPS } from "@/engine/rights";
import type {
  ConsequenceClause,
  GroupId,
  Rule,
  Subject,
  WhatClause,
  WhenClause,
  WhoScope,
} from "@/engine/types";

interface Props {
  subject: Subject;
  situationId: string;
  existingRules: Rule[];
  onWrite: (rule: Rule) => void;
  onSkip: () => void;
}

function Field<T extends string>({
  legend,
  options,
  value,
  onPick,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T | null;
  onPick: (v: T) => void;
}) {
  return (
    <fieldset className="border-t border-moss pt-3">
      <legend className="px-2 text-sm text-quiet">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const picked = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onPick(o.value)}
              aria-pressed={picked}
              className={`rounded-sm px-3 py-2 text-start text-[0.95rem] transition-colors ${
                picked
                  ? "bg-lamp text-night"
                  : "bg-dusk text-paper hover:bg-moss"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function RuleBuilder({
  subject,
  situationId,
  existingRules,
  onWrite,
  onSkip,
}: Props) {
  const { lang, t } = useLanguage();
  const [scope, setScope] = useState<WhoScope | null>(null);
  const [group, setGroup] = useState<GroupId | null>(null);
  const [what, setWhat] = useState<WhatClause | null>(null);
  const [when, setWhen] = useState<WhenClause | null>(null);
  const [consequence, setConsequence] = useState<ConsequenceClause | null>(
    null,
  );

  const needsGroup = scope === "group" || scope === "everyone-except";
  const complete =
    scope !== null &&
    what !== null &&
    when !== null &&
    consequence !== null &&
    (!needsGroup || group !== null);

  const draft: Rule | null = useMemo(() => {
    if (!complete) return null;
    return {
      id: `rule-${situationId}`,
      who: { scope: scope!, group: needsGroup ? group! : undefined },
      what: what!,
      when: when!,
      consequence: consequence!,
      subject,
      writtenAt: situationId,
    };
  }, [
    complete,
    scope,
    group,
    what,
    when,
    consequence,
    subject,
    situationId,
    needsGroup,
  ]);

  const clashes = draft ? textualConflict(draft, existingRules) : [];

  // The sentence assembles as the child picks. Unpicked parts stay as blanks
  // rather than disappearing, so the shape of the rule is visible from the start.
  const parts = [
    scope
      ? fill(
          findOption(whoOptions(lang), scope).template,
          subject,
          lang,
          group ?? undefined,
        )
      : null,
    what
      ? fill(findOption(whatOptions(lang), what).template, subject, lang)
      : null,
    when
      ? fill(findOption(whenOptions(lang), when).template, subject, lang)
      : null,
    consequence
      ? fill(
          findOption(consequenceOptions(lang), consequence).template,
          subject,
          lang,
        )
      : null,
  ];
  const blanks = [
    t("builder.blank_who"),
    t("builder.blank_what"),
    t("builder.blank_when"),
    t("builder.blank_consequence"),
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-sm bg-paper p-5 text-ink">
        <p className="mb-1 text-sm text-ink/60">
          {t("builder.subject_prefix", {
            subject: subjectForms(lang)[subject].label,
          })}
        </p>
        <p className="font-book text-[1.35rem] leading-relaxed">
          {parts.map((part, i) => (
            <span key={i}>
              {part ?? (
                <span className="rule-slot text-ink/35">{blanks[i]}</span>
              )}
              {i === 0 ? " " : i === 3 ? "." : ", "}
              {i === 2 ? t("builder.when_connector") : null}
            </span>
          ))}
        </p>
      </div>

      <Field
        legend={t("builder.legend_who")}
        options={whoOptions(lang)}
        value={scope}
        onPick={(v) => {
          setScope(v);
          if (v !== "group" && v !== "everyone-except") setGroup(null);
        }}
      />

      {needsGroup ? (
        <Field
          legend={t("builder.legend_group")}
          options={GROUPS.map((g) => ({
            value: g,
            label: groupLabel(lang)[g],
          }))}
          value={group}
          onPick={setGroup}
        />
      ) : null}

      <Field
        legend={t("builder.legend_what")}
        options={whatOptions(lang)}
        value={what}
        onPick={setWhat}
      />
      <Field
        legend={t("builder.legend_when")}
        options={whenOptions(lang)}
        value={when}
        onPick={setWhen}
      />
      <Field
        legend={t("builder.legend_consequence")}
        options={consequenceOptions(lang)}
        value={consequence}
        onPick={setConsequence}
      />

      {clashes.length > 0 ? (
        <div className="settle rounded-sm border-s-2 border-harm bg-dusk p-4">
          <p className="mb-2 text-[0.95rem]">{t("builder.clash_intro")}</p>
          <p className="font-book text-[1.05rem] text-lamp">
            {ruleSentence(clashes[0], lang)}
          </p>
          <p className="mt-2 text-sm text-quiet">{t("builder.clash_note")}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          disabled={!draft}
          onClick={() => draft && onWrite(draft)}
          className="rounded-sm bg-lamp px-5 py-2.5 text-night disabled:cursor-not-allowed disabled:bg-moss disabled:text-quiet"
        >
          {t("builder.write")}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-sm px-4 py-2.5 text-quiet underline underline-offset-4 hover:text-paper"
        >
          {t("builder.skip")}
        </button>
      </div>
    </div>
  );
}
