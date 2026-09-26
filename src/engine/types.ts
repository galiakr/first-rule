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

/**
 * The five closed trait dimensions a precedent can be essential on (§6.1).
 * Each maps directly onto a field already carried by Situation/Precedent —
 * no new vocabulary, just a way to name which of those fields mattered.
 */
export type TraitKey = "act" | "justification" | "power" | "subject" | "actor";

/**
 * One candidate answer to "what determined it?" — a full sentence the child
 * taps, not a category name (§6.1). Picking it saves `traits` as the
 * precedent's essentialTraits.
 */
export interface PrecedentOption {
  traits: TraitKey[];
  label: string;
}

/**
 * A ruling the child made on a past situation, available to match future
 * ones (§6.1). Every resolved situation produces one automatically — see
 * game.ts's resolve(). `essentialTraits` is null until the first situation
 * that might invoke this precedent asks the child what determined it.
 */
export interface Precedent {
  id: string;
  /** The situation where this ruling was made. */
  situationId: string;
  /** What the child decided. Null when noRuleOutcome applied. */
  governedBy: WhatClause | null;
  overrode: boolean;
  actorId: string;
  act: ActKind;
  justification: Justification;
  power: PowerBalance;
  subject: Subject;
  essentialTraits: TraitKey[] | null;
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

  /**
   * id of an earlier situation this one might invoke as a precedent (§6.1).
   * Content-authored, not runtime-detected — keeps matching itself a plain
   * trait-equality check with no thresholds. Required alongside
   * `precedentOptions` when set (enforced by a content test).
   */
  precedentOf?: string;
  /** 2–3 options offered the first time this precedent is compared. */
  precedentOptions?: PrecedentOption[];

  /** Applied when no written rule covers this situation. */
  noRuleOutcome: Outcome;
  /** Applied when a rule covers it, keyed by the rule's WHAT clause. */
  outcomes: Partial<Record<WhatClause, Outcome>>;
  /** Applied when the child goes against a rule that did apply. */
  overrideOutcome: Outcome;
  /**
   * Outcomes for a situation that branches on something other than its WHAT
   * clause — chapter 5 branches on which authority form was written, and on
   * whether the child still decides. Looked up first when a variant key is
   * passed; the WHAT-keyed outcomes above are the fallback.
   */
  variantOutcomes?: Record<string, Outcome>;
  /**
   * This situation asks for the authority rule rather than an ordinary one
   * (§9.5). Mutually exclusive with `invitesRule` — pinned by a content test.
   */
  invitesAuthority?: boolean;
  /**
   * This situation offers to tear the three-job arrangement up (§9.6). Only
   * meaningful once somebody else holds the judicial job — if the child kept
   * it, there is nothing to revoke.
   */
  offersRevoke?: boolean;
  /**
   * This situation is the child's one attempt at changing a rule (§9.7).
   * What happens is decided by the amendment rule they wrote at the end of
   * chapter 5, not by anything here.
   */
  invitesAmendment?: boolean;
  /**
   * Whose agreement the child needs, if their amendment rule says two people
   * must agree (§9.7). Authored because it depends on whom the rule at issue
   * actually protects, which the engine cannot see.
   */
  amendmentStakeholder?: GroupId;
  /** Said after the outcome — the concept, named only now (§2). */
  lesson: string;
}

/* ---- changing what's already written (§9.7) ---- */

/**
 * What happened when the child tried to change a rule.
 *
 * Every one of these is the amendment rule they wrote at the end of chapter 5
 * doing exactly what it says — written behind a veil, before they knew they
 * would be the one who wanted something changed.
 */
export type AmendmentResult =
  | "applied" // whoever wrote it may change it, and they did
  | "delayed" // the whole village has to agree; it takes until tomorrow
  | "refused-no-agreement" // two must agree, and the other one won't
  | "refused-unchangeable"; // they wrote that a rule cannot be changed

/** A change the whole village agreed to, which lands one situation later. */
export interface PendingAmendment {
  ruleId: string;
  next: Rule;
  /** The situation after which it takes effect. */
  appliesAfter: string;
}

/* ---- the three jobs (§9.6) ---- */

/**
 * Who holds one of the three jobs. "village" is resolved at the moment it is
 * read, to whichever group trusts the child most — see resolveHolder.
 */
export type Holder =
  | { kind: "you" }
  | { kind: "actor"; actorId: string }
  | { kind: "group"; groupId: GroupId }
  | { kind: "village" };

/** The three jobs the child has been doing all game without noticing (§9.6). */
export type Job = "legislative" | "judicial" | "executive";

export type Separation = Record<Job, Holder>;

/**
 * One of the child's own past moments, replayed back to them with a name on
 * it. Built from the log, never authored — see keyMoments.
 */
export interface KeyMoment {
  job: Job;
  /** Null when the child never once did this job — said in-world, not faked. */
  situationId: string | null;
  kind: ResolutionKind | null;
}

/* ---- who decides (§9.5) ---- */

/**
 * The five shapes authority can take (§9.5). A separate structure from the
 * 4x4 rule builder on purpose: §11 forbids opening that builder past four
 * options per field, and this is a different kind of rule.
 */
export type AuthorityForm =
  | "you" // אני מחליט
  | "most-senior" // מי שהכי ותיק — יותם, not the child
  | "two-together" // שניים יחד — the child and the most senior
  | "each-alone" // כל אחד לעצמו
  | "village-chooses"; // הכפר בוחר — an election

/** Who decides, and who that rule reaches. The WHO field sets who votes. */
export interface AuthorityRule {
  form: AuthorityForm;
  who: RuleWho;
}

/** How a written rule may later be changed (§10). Written behind a veil. */
export type AmendmentForm =
  | "author" // מי שכתב אותו
  | "two-agree" // שניים צריכים להסכים
  | "whole-village" // כל הכפר
  | "cannot"; // אי אפשר לשנות

/**
 * One round of voting, decided entirely by trust the child already earned
 * or burned (§9: one round, no campaign, no promises). Groups, never counts
 * — §7's rule that trust is never a number holds here too.
 */
export interface Election {
  eligible: GroupId[];
  votedFor: GroupId[];
  votedAgainst: GroupId[];
  abstained: GroupId[];
  won: boolean;
}

/** Who rules on situations from here on. */
export type Decider = "you" | "other";

/**
 * One chapter's content. `epilogue` is said at the chapter end, after the
 * rights board — it names the chapter's concept in words, which only some
 * chapters do (§2: felt first, named afterwards, and not every chapter has
 * a single idea to name).
 */
export interface Chapter {
  title: string;
  intro: string;
  epilogue?: string;
  situations: Situation[];
}

/* ---- game state ---- */

export type ProtectionState = "intact" | "strained" | "broken";

/** Protection state per group. Key is `${protection}:${group}`. */
export type RightsBoard = Record<string, ProtectionState>;

export type TrustLevel = "comes-to-you" | "comes-but" | "stops-coming";

/**
 * What the child actually did at a situation — not what happened to the
 * village, but which *kind of work* they were doing (§9.6).
 *
 * Chapter 6 opens by replaying three of the child's own moments and giving
 * each one a name: they have been legislating, judging and enforcing all
 * game without noticing. None of that is recoverable from the rules or the
 * rights board, so it has to be recorded as it happens.
 *
 *   wrote-rule / wrote-authority  → חקיקה, legislating
 *   ruled-by-precedent /
 *     chose-in-collision          → שפיטה, judging
 *   applied-rule                  → ביצוע, making it actually happen
 *   overrode                      → none of the three, and §7's whole subject
 *   no-rule                       → nothing was decided
 */
export type ResolutionKind =
  | "wrote-rule"
  | "wrote-authority"
  | "applied-rule"
  | "overrode"
  | "ruled-by-precedent"
  | "chose-in-collision"
  | "no-rule";

export interface LogEntry {
  situationId: string;
  /** Rules that fired, if any. */
  appliedRuleIds: string[];
  /** The child went against a rule that applied. */
  overrode: boolean;
  /** Which kind of work the child was doing here — see ResolutionKind. */
  kind: ResolutionKind;
}

export interface GameState {
  chapter: number;
  /** Total situations resolved so far, across all chapters. */
  cursor: number;
  rules: Rule[];
  rights: RightsBoard;
  /** Raw trust per group. Never shown as a number (§7). */
  trust: Record<GroupId, number>;
  log: LogEntry[];
  /** Every resolved situation, available for future precedent matching. */
  precedents: Precedent[];
  /** True once the "sometimes you only find out later" line has been said (§6.2). */
  sawCollisionNote: boolean;
  /** True once the "so the rules are whatever you decide" line has been said (§7). */
  sawOverrideNote: boolean;

  /* ---- chapter 5 ---- */

  /** The rule about who decides, once written (§9.5). */
  authority: AuthorityRule | null;
  /** The single round of voting, if the child chose "the village chooses". */
  election: Election | null;
  /**
   * Who rules from here on. "other" after losing an election, or after
   * writing that the most senior decides — which is יותם, not the child.
   * Losing is a real outcome and the game continues under it (§9.5).
   */
  decider: Decider;
  /** How a rule may be changed. Written at the closing, used in chapter 7. */
  amendment: AmendmentForm | null;
  /** True once the book is closed (§10). No situation may invite a rule after. */
  bookClosed: boolean;

  /* ---- chapter 6 ---- */

  /**
   * Who holds each of the three jobs, once the village has staffed them.
   * Null until chapter 6 does so; reset to all-"you" if the child revokes
   * the arrangement, which costs them everything they built (§9.6).
   */
  separation: Separation | null;

  /* ---- chapter 7 ---- */

  /**
   * A change the whole village agreed to but that has not landed yet (§9.7).
   * Applied by `resolve()` once the named situation is behind them — the
   * delay is the point, and someone is hurt inside it.
   */
  pendingAmendment: PendingAmendment | null;
  /**
   * What came of the child's one attempt at changing a rule. Null until they
   * try — recorded rather than re-derived, because "the whole village agreed
   * and it has now landed" and "nobody agreed" both end with no pending
   * change and must not read the same.
   */
  amendmentResult: AmendmentResult | null;
}
