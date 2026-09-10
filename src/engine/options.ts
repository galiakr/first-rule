/**
 * The builder: four fields, four options each, closed at 16 (design doc §6).
 *
 * `label` is what the child taps. `template` is how the option reads inside the
 * assembled rule; `{et}`, `{be}` and `{group}` are filled in, so the four picks
 * together form one Hebrew sentence.
 *
 * `label` and `GROUP_LABEL` come from the language tokens (src/content/tokens)
 * since they're plain text. `template` and `SUBJECT_FORMS` stay hardcoded
 * Hebrew — they encode Hebrew grammatical case (accusative/prepositional
 * forms of the subject), not just wording, so translating them is a sentence-
 * composer redesign, not a token swap. Out of scope until a second language
 * is actually being wired up.
 *
 * Do not add a fifth option to any field without a situation that pinches it.
 */

import { t } from "@/content/tokens";

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

export const WHO_OPTIONS: Option<WhoScope>[] = [
  {
    value: "residents",
    label: t("builder.who.residents"),
    template: "מי שגר בכפר",
  },
  {
    value: "anyone-present",
    label: t("builder.who.anyone_present"),
    template: "כל מי שנמצא כאן עכשיו",
  },
  { value: "group", label: t("builder.who.group"), template: "כל {group}" },
  {
    value: "everyone-except",
    label: t("builder.who.everyone_except"),
    template: "כולם חוץ מ{group}",
  },
];

export const WHAT_OPTIONS: Option<WhatClause>[] = [
  {
    value: "ask-first",
    label: t("builder.what.ask_first"),
    template: "לא ייקח {et} בלי לבקש",
  },
  {
    value: "forbidden",
    label: t("builder.what.forbidden"),
    template: "לא ייגע {be} בכלל",
  },
  {
    value: "by-turn",
    label: t("builder.what.by_turn"),
    template: "ייקח {et} לפי תור",
  },
  {
    value: "share-equally",
    label: t("builder.what.share_equally"),
    template: "יחלוק {et} שווה בשווה",
  },
];

export const WHEN_OPTIONS: Option<WhenClause>[] = [
  { value: "always", label: t("builder.when.always"), template: "תמיד" },
  {
    value: "when-scarce",
    label: t("builder.when.when_scarce"),
    template: "רק כשאין מספיק לכולם",
  },
  {
    value: "when-harmed",
    label: t("builder.when.when_harmed"),
    template: "רק אם מישהו נפגע מזה",
  },
  {
    value: "first-time-forgiven",
    label: t("builder.when.first_time_forgiven"),
    template: "מהפעם השנייה והלאה",
  },
];

export const CONSEQUENCE_OPTIONS: Option<ConsequenceClause>[] = [
  {
    value: "return-or-fix",
    label: t("builder.consequence.return_or_fix"),
    template: "יצטרך להחזיר או לתקן",
  },
  {
    value: "help-victim",
    label: t("builder.consequence.help_victim"),
    template: "יצטרך לעזור לנפגע יום אחד",
  },
  {
    value: "lose-next-turn",
    label: t("builder.consequence.lose_next_turn"),
    template: "יפסיד את הזכות לזה בפעם הבאה",
  },
  {
    value: "village-decides",
    label: t("builder.consequence.village_decides"),
    template: "הכפר יחליט בכל מקרה לגופו",
  },
];

/** The subject is inherited from the situation, never chosen (§6). */
export interface SubjectForms {
  label: string;
  /** Accusative: "את המים". */
  et: string;
  /** With ב: "במים". */
  be: string;
}

export const SUBJECT_FORMS: Record<Subject, SubjectForms> = {
  mayim: { label: "המים", et: "את המים", be: "במים" },
  shetach: { label: "השטח", et: "את השטח", be: "בשטח" },
  shvil: { label: "השביל", et: "את השביל", be: "בשביל" },
  chefetz: {
    label: "חפץ של מישהו אחר",
    et: "את החפץ של מישהו אחר",
    be: "בחפץ של מישהו אחר",
  },
  davar: {
    label: "דבר שמישהו סיפר",
    et: "את מה שמישהו סיפר לו",
    be: "במה שמישהו סיפר לו",
  },
};

export const GROUP_LABEL: Record<GroupId, string> = {
  vatikim: t("village.groups.vatikim.label"),
  hadashim: t("village.groups.hadashim.label"),
  roim: t("village.groups.roim.label"),
  banaim: t("village.groups.banaim.label"),
  yeladim: t("village.groups.yeladim.label"),
  ovrim: t("village.groups.ovrim.label"),
};

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
  group?: GroupId,
): string {
  const forms = SUBJECT_FORMS[subject];
  return template
    .split("{et}")
    .join(forms.et)
    .split("{be}")
    .join(forms.be)
    .split("{group}")
    .join(group ? GROUP_LABEL[group] : "");
}
