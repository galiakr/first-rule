/**
 * Two kinds of conflict, and the split between them is not arbitrary (§6.2).
 *
 *   textualConflict  — the contradiction is in the rules themselves: same
 *                      subject, same reach, two WHAT clauses that cannot both
 *                      be true. Cheap and absolute, so we warn while writing.
 *
 *   fieldCollision   — the contradiction only exists under conditions: two
 *                      rules with different WHEN clauses that both happen to
 *                      hold, or a person who belongs to two groups at once.
 *                      There is no way to find this without running the
 *                      situation, so the child finds out when it happens.
 *
 * That difference is also the lesson, and the game says it out loud once.
 */

import { applicableRules } from "./match";
import type { Actor, Rule, RuleWho, Situation, WhatClause } from "./types";

/** WHAT clauses that cannot both govern the same thing. */
const INCOMPATIBLE: Record<WhatClause, WhatClause[]> = {
  forbidden: ["ask-first", "by-turn", "share-equally"],
  "ask-first": ["forbidden"],
  "by-turn": ["forbidden", "share-equally"],
  "share-equally": ["forbidden", "by-turn"],
};

export function whatClausesClash(a: WhatClause, b: WhatClause): boolean {
  return INCOMPATIBLE[a].includes(b);
}

function sameReach(a: RuleWho, b: RuleWho): boolean {
  return a.scope === b.scope && a.group === b.group;
}

/**
 * Rules already in the book that flatly contradict the one being written.
 * Detectable from the text alone, so the builder can warn before saving.
 */
export function textualConflict(candidate: Rule, existing: Rule[]): Rule[] {
  return existing.filter(
    (r) =>
      r.id !== candidate.id &&
      r.subject === candidate.subject &&
      sameReach(r.who, candidate.who) &&
      whatClausesClash(r.what, candidate.what),
  );
}

export interface Collision {
  rules: Rule[];
}

/**
 * Rules that both fire here and pull in opposite directions.
 * Only discoverable by running the situation.
 */
export function fieldCollision(
  rules: Rule[],
  situation: Situation,
  actors: Record<string, Actor>,
): Collision | null {
  const firing = applicableRules(rules, situation, actors);
  if (firing.length < 2) return null;

  for (let i = 0; i < firing.length; i++) {
    for (let j = i + 1; j < firing.length; j++) {
      if (whatClausesClash(firing[i].what, firing[j].what)) {
        return { rules: [firing[i], firing[j]] };
      }
    }
  }
  return null;
}
