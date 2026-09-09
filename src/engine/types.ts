/**
 * Core data model for כלל ראשון.
 * Everything here is plain data — no React, no I/O. The whole game is
 * testable through these types and the pure functions in this folder.
 */

/** The six groups in the village (design doc §4). */
export type GroupId =
  | "vatikim" // הוותיקים
  | "hadashim" // החדשים
  | "roim" // הרועים
  | "banaim" // הבנאים
  | "yeladim" // הילדים
  | "ovrim"; // העוברים — no voice, not residents

/** What a rule is about. Inherited from the situation, never chosen (§6). */
export type Subject = "mayim" | "shetach" | "shvil" | "chefetz" | "davar";

/* ---- the four builder fields, four options each (§6) ---- */

export type WhoScope =
  | "residents" // מי שגר בכפר
  | "anyone-present" // כל מי שנמצא כאן עכשיו
  | "group" // קבוצה מסוימת
  | "everyone-except"; // כולם חוץ מ־

export type WhatClause =
  | "ask-first" // אסור לקחת בלי לבקש
  | "forbidden" // אסור בכלל
  | "by-turn" // מותר, אבל לפי תור
  | "share-equally"; // חייבים לחלוק שווה

export type WhenClause =
  | "always" // תמיד
  | "when-scarce" // רק כשאין מספיק לכולם
  | "when-harmed" // רק אם מישהו נפגע מזה
  | "first-time-forgiven"; // רק בפעם הראשונה סולחים

export type ConsequenceClause =
  | "return-or-fix" // צריך להחזיר או לתקן
  | "help-victim" // צריך לעזור לנפגע יום אחד
  | "lose-next-turn" // מפסיד את הזכות לזה בפעם הבאה
  | "village-decides"; // הכפר מחליט בכל מקרה לגופו

export interface RuleWho {
  scope: WhoScope;
  /** Required for "group" and "everyone-except". */
  group?: GroupId;
}

export interface Rule {
  id: string;
  who: RuleWho;
  what: WhatClause;
  when: WhenClause;
  consequence: ConsequenceClause;
  /** Inherited from the situation that prompted the rule. */
  subject: Subject;
  /** Situation id where the child wrote it — the book shows this. */
  writtenAt: string;
}

/** A person in the village. */
export interface Actor {
  id: string;
  name: string;
  groups: GroupId[];
  /** Lives in the village. False for העוברים. */
  resident: boolean;
}

/* ---- situations ---- */

export type ActKind =
  | "took-without-asking"
  | "blocked"
  | "broke"
  | "refused-to-share"
  | "told-what-was-private";

export type Justification =
  | "needed-more"
  | "was-mine-first"
  | "nobody-said-no"
  | "everyone-does-it"
  | "meant-to-return";

export type PowerBalance = "victim-weaker" | "equal" | "victim-stronger";

/** The six protections (§8). */
export type Protection =
  | "kinyan" // קניין
  | "bitui" // ביטוי
  | "shivyon" // שוויון בפני החוק
  | "machse" // מחסה
  | "halich" // הליך הוגן
  | "shayachut"; // שייכות

export interface RightsEffect {
  protection: Protection;
  group: GroupId;
  /** strain: intact→strained. break: →broken. repair: →intact. */
  move: "strain" | "break" | "repair";
}

export interface TrustEffect {
  group: GroupId;
  delta: number;
}

export interface Outcome {
  /** What the village sees happen. Child-facing copy. */
  text: string;
  rights: RightsEffect[];
  trust: TrustEffect[];
}

export interface Situation {
  id: string;
  chapter: number;
  /** Short label for the rulebook and the log. */
  title: string;
  /** The scene, as the village tells it. */
  text: string;
  /** Whose voice opens the scene — drives the trust-flavoured opener. */
  speakerGroup: GroupId;

  subject: Subject;
  act: ActKind;
  justification: Justification;
  power: PowerBalance;
  actorId: string;
  victimId: string;

  /** Facts the WHEN clause tests against. */
  scarce: boolean;
  someoneHarmed: boolean;
  /** True when this is the actor's first offence in the village. */
  firstOffence: boolean;

  /** Situations 1–2 of a chapter invite a rule; 3–4 collide with one. */
  invitesRule: boolean;

  /** Applied when no written rule covers this situation. */
  noRuleOutcome: Outcome;
  /** Applied when a rule covers it, keyed by the rule's WHAT clause. */
  outcomes: Partial<Record<WhatClause, Outcome>>;
  /** Applied when the child goes against a rule that did apply. */
  overrideOutcome: Outcome;
  /** Said after the outcome — the concept, named only now (§2). */
  lesson: string;
}

/* ---- game state ---- */

export type ProtectionState = "intact" | "strained" | "broken";

/** Protection state per group. Key is `${protection}:${group}`. */
export type RightsBoard = Record<string, ProtectionState>;

export type TrustLevel = "comes-to-you" | "comes-but" | "stops-coming";

export interface LogEntry {
  situationId: string;
  /** Rules that fired, if any. */
  appliedRuleIds: string[];
  /** The child went against a rule that applied. */
  overrode: boolean;
}

export interface GameState {
  chapter: number;
  /** Index into the chapter's situation list. */
  cursor: number;
  rules: Rule[];
  rights: RightsBoard;
  /** Raw trust per group. Never shown as a number (§7). */
  trust: Record<GroupId, number>;
  log: LogEntry[];
  /** True once the "sometimes you only find out later" line has been said (§6.2). */
  sawCollisionNote: boolean;
}
