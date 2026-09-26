/**
 * The builder: four fields, four options each, closed at 16 (design doc §6).
 *
 * `label` is what the child taps. `template` is how the option reads inside the
 * assembled rule; `{et}`, `{be}` and `{group}` are filled in, so the four picks
 * together form one sentence.
 *
 * Everything here is a function of the language, including the templates and
 * the subject forms. Hebrew needs the subject in an accusative ({et}) and a
 * prepositional ({be}) form where English just repeats the plain noun, so the
 * two forms stay in the token table per language rather than being hardcoded.
 * `rule.sentence` carries the punctuation and connector that join the four.
 *
 * Do not add a fifth option to any field without a situation that pinches it.
 */

import { perLanguage, translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";

import type {
  AmendmentForm,
  AuthorityForm,
  AuthorityRule,
  ConsequenceClause,
  GroupId,
  Subject,
  WhatClause,
  WhenClause,
  WhoScope,
} from "./types";

export interface Option<T extends string> {
  value: T;
  label: string;
  /** Fragment for the assembled sentence. May contain {et} / {be} / {group}. */
  template: string;
}

function option<T extends string>(
  t: (key: string) => string,
  field: string,
  value: T,
  key: string,
): Option<T> {
  return {
    value,
    label: t(`builder.${field}.${key}.label`),
    template: t(`builder.${field}.${key}.template`),
  };
}

export const whoOptions = perLanguage((lang: Lang): Option<WhoScope>[] => {
  const t = translator(lang);
  return [
    option(t, "who", "residents", "residents"),
    option(t, "who", "anyone-present", "anyone_present"),
    option(t, "who", "group", "group"),
    option(t, "who", "everyone-except", "everyone_except"),
  ];
});

export const whatOptions = perLanguage((lang: Lang): Option<WhatClause>[] => {
  const t = translator(lang);
  return [
    option(t, "what", "ask-first", "ask_first"),
    option(t, "what", "forbidden", "forbidden"),
    option(t, "what", "by-turn", "by_turn"),
    option(t, "what", "share-equally", "share_equally"),
  ];
});

export const whenOptions = perLanguage((lang: Lang): Option<WhenClause>[] => {
  const t = translator(lang);
  return [
    option(t, "when", "always", "always"),
    option(t, "when", "when-scarce", "when_scarce"),
    option(t, "when", "when-harmed", "when_harmed"),
    option(t, "when", "first-time-forgiven", "first_time_forgiven"),
  ];
});

export const consequenceOptions = perLanguage(
  (lang: Lang): Option<ConsequenceClause>[] => {
    const t = translator(lang);
    return [
      option(t, "consequence", "return-or-fix", "return_or_fix"),
      option(t, "consequence", "help-victim", "help_victim"),
      option(t, "consequence", "lose-next-turn", "lose_next_turn"),
      option(t, "consequence", "village-decides", "village_decides"),
    ];
  },
);

/** The subject is inherited from the situation, never chosen (§6). */
export interface SubjectForms {
  label: string;
  /** Accusative in Hebrew ("את המים"); the plain noun in English. */
  et: string;
  /** With the preposition ב in Hebrew ("במים"); the plain noun in English. */
  be: string;
}

const SUBJECTS: Subject[] = ["water", "land", "path", "things", "confidence"];

export const subjectForms = perLanguage(
  (lang: Lang): Record<Subject, SubjectForms> => {
    const t = translator(lang);
    const forms = {} as Record<Subject, SubjectForms>;
    for (const s of SUBJECTS) {
      forms[s] = {
        label: t(`subject.${s}.label`),
        et: t(`subject.${s}.et`),
        be: t(`subject.${s}.be`),
      };
    }
    return forms;
  },
);

/**
 * The five shapes authority can take (§9.5) and the four ways a rule may
 * later be changed (§10). Deliberately separate tables from the 4x4 builder:
 * §11 closes that one at four options per field, and these are different
 * kinds of rule, not a fifth field.
 */
export const authorityOptions = perLanguage(
  (lang: Lang): Option<AuthorityForm>[] => {
    const t = translator(lang);
    const one = (value: AuthorityForm, key: string): Option<AuthorityForm> => ({
      value,
      label: t(`authority.form.${key}.label`),
      template: t(`authority.form.${key}.template`),
    });
    return [
      one("you", "you"),
      one("most-senior", "most_senior"),
      one("two-together", "two_together"),
      one("each-alone", "each_alone"),
      one("village-chooses", "village_chooses"),
    ];
  },
);

export const amendmentOptions = perLanguage(
  (lang: Lang): Option<AmendmentForm>[] => {
    const t = translator(lang);
    const one = (value: AmendmentForm, key: string): Option<AmendmentForm> => ({
      value,
      label: t(`closing.amendment.${key}.label`),
      template: t(`closing.amendment.${key}.template`),
    });
    return [
      one("author", "author"),
      one("two-agree", "two_agree"),
      one("whole-village", "whole_village"),
      one("cannot", "cannot"),
    ];
  },
);

export const groupLabel = perLanguage((lang: Lang): Record<GroupId, string> => {
  const t = translator(lang);
  return {
    "old-timers": t("village.groups.old-timers.label"),
    newcomers: t("village.groups.newcomers.label"),
    shepherds: t("village.groups.shepherds.label"),
    builders: t("village.groups.builders.label"),
    children: t("village.groups.children.label"),
    "passers-through": t("village.groups.passers-through.label"),
  };
});

export function findOption<T extends string>(
  options: Option<T>[],
  value: T,
): Option<T> {
  const found = options.find((o) => o.value === value);
  if (!found) throw new Error(`Unknown option: ${value}`);
  return found;
}

/** Fill {et}, {be} and {group} in a fragment. */
export function fill(
  template: string,
  subject: Subject,
  lang: Lang,
  group?: GroupId,
): string {
  const forms = subjectForms(lang)[subject];
  return template
    .split("{et}")
    .join(forms.et)
    .split("{be}")
    .join(forms.be)
    .split("{group}")
    .join(group ? groupLabel(lang)[group] : "");
}

/** The authority rule as one line, for the book. */
export function authoritySentence(
  authority: AuthorityRule,
  lang: Lang,
): string {
  const form = findOption(authorityOptions(lang), authority.form).template;
  const who = fill(
    findOption(whoOptions(lang), authority.who.scope).template,
    // The authority rule is not about a subject, so {et}/{be} never appear
    // in its WHO fragment; any subject would do here.
    "water",
    lang,
    authority.who.group,
  );
  return translator(lang)("authority.sentence", { form, who });
}
