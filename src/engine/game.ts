/**
 * The game as a reducer over plain state. No React here on purpose — the whole
 * of chapter 1 can be played through in a test without rendering anything.
 */

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
      return situation.invitesRule
        ? { kind: "write-rule", situation, precedentContext }
        : { kind: "no-rule", situation, precedentContext };
    }
  }

  if (situation.invitesRule) {
    return { kind: "write-rule", situation };
  }
  return { kind: "no-rule", situation };
}

/** The outcome the village gets, given how the situation was settled. */
export function outcomeFor(
  situation: Situation,
  what: WhatClause | null,
  overrode: boolean,
): Outcome {
  if (overrode) return situation.overrideOutcome;
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
}

export function resolve(state: GameState, resolution: Resolution): GameState {
  const outcome = outcomeFor(
    resolution.situation,
    resolution.governedBy,
    resolution.overrode,
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

  return {
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
      },
    ],
    precedents: [...state.precedents, newPrecedent],
    sawCollisionNote:
      state.sawCollisionNote || resolution.appliedRuleIds.length > 1,
  };
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
