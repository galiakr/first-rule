/**
 * The game as a reducer over plain state. No React here on purpose — the whole
 * of chapter 1 can be played through in a test without rendering anything.
 */

import { applyPendingAmendment } from "./amendment";
import { fieldCollision } from "./conflict";
import { applicableRules } from "./match";
import { traitDifferences, traitsMatch } from "./precedent";
import {
  applyRights,
  applyTrust,
  emptyRightsBoard,
  emptyTrust,
} from "./rights";
import type {
  Actor,
  GameState,
  Outcome,
  Precedent,
  Rule,
  Situation,
  ResolutionKind,
  TraitKey,
  WhatClause,
} from "./types";

export function initialState(chapter = 1): GameState {
  return {
    chapter,
    cursor: 0,
    rules: [],
    rights: emptyRightsBoard(),
    trust: emptyTrust(),
    log: [],
    precedents: [],
    sawCollisionNote: false,
    sawOverrideNote: false,
    authority: null,
    election: null,
    decider: "you",
    amendment: null,
    bookClosed: false,
    separation: null,
    pendingAmendment: null,
    amendmentResult: null,
  };
}

/** Source situation + how it differs, shown as context on write-rule/no-rule. */
export interface PrecedentContext {
  precedent: Precedent;
  source: Situation;
  differences: TraitKey[];
}

/** What the child is being asked to do at this situation. */
export type Prompt =
  | {
      kind: "write-rule";
      situation: Situation;
      precedentContext?: PrecedentContext;
    }
  | { kind: "rule-applies"; situation: Situation; rules: Rule[] }
  | { kind: "write-authority"; situation: Situation }
  | { kind: "amend"; situation: Situation }
  | {
      kind: "collision";
      situation: Situation;
      rules: Rule[];
      firstTime: boolean;
    }
  | {
      kind: "no-rule";
      situation: Situation;
      precedentContext?: PrecedentContext;
    }
  | {
      kind: "precedent-choice";
      situation: Situation;
      precedent: Precedent;
      source: Situation;
    }
  | {
      kind: "precedent-reminder";
      situation: Situation;
      precedent: Precedent;
      source: Situation;
    };

export function promptFor(
  state: GameState,
  situation: Situation,
  actors: Record<string, Actor>,
  situationsById: Record<string, Situation>,
): Prompt {
  // The authority question comes before everything else. c5s2 exists only to
  // ask it, and it must not be shadowed by an ordinary rule that happens to
  // fire on the same scene (§9.5).
  if (situation.invitesAuthority && !state.authority) {
    return { kind: "write-authority", situation };
  }

  // The one attempt at changing a rule (§9.7). Like the authority question,
  // it comes before everything else — an ordinary rule firing on the scene
  // is not what the scene is about.
  if (situation.invitesAmendment && state.amendmentResult === null) {
    return { kind: "amend", situation };
  }

  const collision = fieldCollision(state.rules, situation, actors);
  if (collision) {
    return {
      kind: "collision",
      situation,
      rules: collision.rules,
      firstTime: !state.sawCollisionNote,
    };
  }

  const firing = applicableRules(state.rules, situation, actors);
  if (firing.length > 0) {
    return { kind: "rule-applies", situation, rules: firing };
  }

  if (situation.precedentOf) {
    const precedent = state.precedents.find(
      (p) => p.situationId === situation.precedentOf,
    );
    const source = situationsById[situation.precedentOf];
    if (precedent && source) {
      if (precedent.essentialTraits === null) {
        return { kind: "precedent-choice", situation, precedent, source };
      }
      if (traitsMatch(precedent, situation, precedent.essentialTraits)) {
        return { kind: "precedent-reminder", situation, precedent, source };
      }
      const precedentContext = {
        precedent,
        source,
        differences: traitDifferences(precedent, situation),
      };
      return situation.invitesRule && canWriteRules(state)
        ? { kind: "write-rule", situation, precedentContext }
        : { kind: "no-rule", situation, precedentContext };
    }
  }

  if (situation.invitesRule && canWriteRules(state)) {
    return { kind: "write-rule", situation };
  }
  return { kind: "no-rule", situation };
}

/**
 * May the child still put a rule in the book?
 *
 * No once someone else decides (§9.5 — losing is real, and the game goes on
 * under it), and no once the book is closed (§10). Both collapse a
 * write-rule prompt into no-rule rather than removing the situation: the
 * thing still happens, the child just has nothing to do about it.
 */
export function canWriteRules(state: GameState): boolean {
  return state.decider === "you" && !state.bookClosed;
}

/**
 * Which of the three jobs the child was doing, given the prompt in front of
 * them and what they did with it (§9.6).
 *
 * `wrote` means the child put something in the book at this step — a rule,
 * or the line about who decides. Declining either is not legislating; it is
 * simply nothing being decided.
 *
 * Kept here, pure and derived from the prompt, rather than assembled at each
 * call site: chapter 6 replays these moments back to the child by name, and
 * a mislabelled one would put the wrong word on something they did.
 */
export function resolutionKind(
  promptKind: Prompt["kind"],
  decision: { overrode: boolean; wrote: boolean },
): ResolutionKind {
  switch (promptKind) {
    case "write-rule":
      return decision.wrote ? "wrote-rule" : "no-rule";
    case "write-authority":
      return decision.wrote ? "wrote-authority" : "no-rule";
    // Changing a rule is legislating, when it works at all.
    case "amend":
      return decision.wrote ? "wrote-rule" : "no-rule";
    case "rule-applies":
      return decision.overrode ? "overrode" : "applied-rule";
    case "precedent-reminder":
      return decision.overrode ? "overrode" : "ruled-by-precedent";
    case "collision":
      return "chose-in-collision";
    case "no-rule":
    // precedent-choice never settles a situation — answering it re-runs
    // promptFor, which then lands on one of the kinds above.
    case "precedent-choice":
      return "no-rule";
  }
}

/**
 * The outcome the village gets, given how the situation was settled.
 *
 * `variant` is for situations that turn on something other than their WHAT
 * clause — chapter 5's branch on which authority form was written. It wins
 * over the WHAT-keyed outcomes when the situation defines one, because in
 * those situations the WHAT clause is not what the scene is about.
 */
export function outcomeFor(
  situation: Situation,
  what: WhatClause | null,
  overrode: boolean,
  variants: string[] = [],
): Outcome {
  if (overrode) return situation.overrideOutcome;
  for (const key of variants) {
    const found = situation.variantOutcomes?.[key];
    if (found) return found;
  }
  if (what === null) return situation.noRuleOutcome;
  return situation.outcomes[what] ?? situation.noRuleOutcome;
}

export interface Resolution {
  situation: Situation;
  /** The WHAT clause that governed, or null when nothing applied. */
  governedBy: WhatClause | null;
  appliedRuleIds: string[];
  /** The child went against a rule that did apply. */
  overrode: boolean;
  /** Candidate `variantOutcomes` keys, most specific first — see outcomeFor. */
  variants?: string[];
  /** Which kind of work this was — see resolutionKind. */
  kind: ResolutionKind;
}

export function resolve(state: GameState, resolution: Resolution): GameState {
  const outcome = outcomeFor(
    resolution.situation,
    resolution.governedBy,
    resolution.overrode,
    resolution.variants,
  );

  // Going against your own rule costs trust with whoever it was written to
  // protect, and strains equality before the law for them (§7).
  const extraTrust = resolution.overrode
    ? [{ group: resolution.situation.speakerGroup, delta: -1 }]
    : [];

  const { situation } = resolution;
  const newPrecedent: Precedent = {
    id: `prec-${situation.id}`,
    situationId: situation.id,
    governedBy: resolution.governedBy,
    overrode: resolution.overrode,
    actorId: situation.actorId,
    act: situation.act,
    justification: situation.justification,
    power: situation.power,
    subject: situation.subject,
    essentialTraits: null,
  };

  const next: GameState = {
    ...state,
    cursor: state.cursor + 1,
    rights: applyRights(state.rights, outcome.rights),
    trust: applyTrust(state.trust, [...outcome.trust, ...extraTrust]),
    log: [
      ...state.log,
      {
        situationId: resolution.situation.id,
        appliedRuleIds: resolution.appliedRuleIds,
        overrode: resolution.overrode,
        kind: resolution.kind,
      },
    ],
    precedents: [...state.precedents, newPrecedent],
    sawCollisionNote:
      state.sawCollisionNote || resolution.appliedRuleIds.length > 1,
    sawOverrideNote:
      state.sawOverrideNote || saysOverrideNote(state, resolution.overrode),
  };

  // A change the whole village agreed to lands once the situation it was
  // waiting on is behind them (§9.7). The wait is the cost of that form.
  return applyPendingAmendment(next, resolution.situation.id);
}

export function addRule(state: GameState, rule: Rule): GameState {
  return { ...state, rules: [...state.rules, rule] };
}

/**
 * Saves which traits the child named as "what determined it" — the one-time
 * choice that turns a plain past resolution into a precedent the game can
 * later recognize (§6.1). Once set, it does not change.
 */
export function activatePrecedent(
  state: GameState,
  precedentId: string,
  traits: TraitKey[],
): GameState {
  return {
    ...state,
    precedents: state.precedents.map((p) =>
      p.id === precedentId ? { ...p, essentialTraits: traits } : p,
    ),
  };
}

/** Moves to the next chapter. Rules, rights, trust and precedents persist (§10). */
export function advanceChapter(state: GameState): GameState {
  return { ...state, chapter: state.chapter + 1 };
}

/** How many times the child has gone against a rule that applied. */
export function overrideCount(state: GameState): number {
  return state.log.filter((e) => e.overrode).length;
}

/**
 * Should §7's line be said now?
 *
 * The design doc builds the whole game around one sentence — "so the rules
 * here are whatever you decide at the moment?" — said the second time the
 * child goes against a rule that applied. Twice, not once: once is a hard
 * case, twice is a pattern, and the village only names a pattern.
 *
 * Asked *before* resolving, with whether this decision is an override, so
 * the UI can show it alongside that decision's outcome. Said once, ever.
 */
export function saysOverrideNote(
  state: GameState,
  overriding: boolean,
): boolean {
  return overriding && !state.sawOverrideNote && overrideCount(state) + 1 === 2;
}
