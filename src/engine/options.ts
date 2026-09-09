/**
 * The builder: four fields, four options each, closed at 16 (design doc §6).
 *
 * `label` is what the child taps. `template` is how the option reads inside the
 * assembled rule; `{et}`, `{be}` and `{group}` are filled in, so the four picks
 * together form one Hebrew sentence.
 *
 * Do not add a fifth option to any field without a situation that pinches it.
 */

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
  { value: "residents", label: "מי שגר בכפר", template: "מי שגר בכפר" },
  {
    value: "anyone-present",
    label: "כל מי שנמצא כאן עכשיו",
    template: "כל מי שנמצא כאן עכשיו",
  },
  { value: "group", label: "קבוצה מסוימת", template: "כל {group}" },
  {
    value: "everyone-except",
    label: "כולם חוץ מ־",
    template: "כולם חוץ מ{group}",
  },
];

export const WHAT_OPTIONS: Option<WhatClause>[] = [
  {
    value: "ask-first",
    label: "אסור לקחת בלי לבקש",
    template: "לא ייקח {et} בלי לבקש",
  },
  { value: "forbidden", label: "אסור בכלל", template: "לא ייגע {be} בכלל" },
  {
    value: "by-turn",
    label: "מותר, אבל לפי תור",
    template: "ייקח {et} לפי תור",
  },
  {
    value: "share-equally",
    label: "חייבים לחלוק שווה",
    template: "יחלוק {et} שווה בשווה",
  },
];

export const WHEN_OPTIONS: Option<WhenClause>[] = [
  { value: "always", label: "תמיד", template: "תמיד" },
  {
    value: "when-scarce",
    label: "רק כשאין מספיק לכולם",
    template: "רק כשאין מספיק לכולם",
  },
  {
    value: "when-harmed",
    label: "רק אם מישהו נפגע מזה",
    template: "רק אם מישהו נפגע מזה",
  },
  {
    value: "first-time-forgiven",
    label: "בפעם הראשונה סולחים",
    template: "מהפעם השנייה והלאה",
  },
];

export const CONSEQUENCE_OPTIONS: Option<ConsequenceClause>[] = [
  {
    value: "return-or-fix",
    label: "צריך להחזיר או לתקן",
    template: "יצטרך להחזיר או לתקן",
  },
  {
    value: "help-victim",
    label: "צריך לעזור לנפגע יום אחד",
    template: "יצטרך לעזור לנפגע יום אחד",
  },
  {
    value: "lose-next-turn",
    label: "מפסיד את הזכות לזה בפעם הבאה",
    template: "יפסיד את הזכות לזה בפעם הבאה",
  },
  {
    value: "village-decides",
    label: "הכפר מחליט בכל מקרה לגופו",
    template: "הכפר יחליט בכל מקרה לגופו",
  },
];

/** The subject is inherited from the situation, never picked (§6). */
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
  vatikim: "הוותיקים",
  hadashim: "החדשים",
  roim: "הרועים",
  banaim: "הבנאים",
  yeladim: "הילדים",
  ovrim: "העוברים",
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
