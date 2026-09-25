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

const SUBJECTS: Subject[] = ["mayim", "shetach", "shvil", "chefetz", "davar"];

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

export const groupLabel = perLanguage((lang: Lang): Record<GroupId, string> => {
  const t = translator(lang);
  return {
    vatikim: t("village.groups.vatikim.label"),
    hadashim: t("village.groups.hadashim.label"),
    roim: t("village.groups.roim.label"),
    banaim: t("village.groups.banaim.label"),
    yeladim: t("village.groups.yeladim.label"),
    ovrim: t("village.groups.ovrim.label"),
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
