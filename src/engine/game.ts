/**
 * The game as a reducer over plain state. No React here on purpose — the whole
 * of chapter 1 can be played through in a test without rendering anything.
 */

import { fieldCollision } from "./conflict";
import { applicableRules } from "./match";
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
  Rule,
  Situation,
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
    sawCollisionNote: false,
  };
}

/** What the child is being asked to do at this situation. */
export type Prompt =
  | { kind: "write-rule"; situation: Situation }
  | { kind: "rule-applies"; situation: Situation; rules: Rule[] }
  | {
      kind: "collision";
      situation: Situation;
      rules: Rule[];
      firstTime: boolean;
    }
  | { kind: "no-rule"; situation: Situation };

export function promptFor(
  state: GameState,
  situation: Situation,
  actors: Record<string, Actor>,
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
    sawCollisionNote:
      state.sawCollisionNote || resolution.appliedRuleIds.length > 1,
  };
}

export function addRule(state: GameState, rule: Rule): GameState {
  return { ...state, rules: [...state.rules, rule] };
}

/** How many times the child has gone against a rule that applied. */
export function overrideCount(state: GameState): number {
  return state.log.filter((e) => e.overrode).length;
}
