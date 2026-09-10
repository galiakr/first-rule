/**
 * Does a past ruling apply to a new situation? (design doc §6.1)
 *
 * Like match.ts, this is deterministic and total — exact equality on a
 * closed set of trait keys, never a similarity score. Which past situation
 * is even worth comparing to is a content decision (Situation.precedentOf),
 * not something this module goes looking for.
 */

import type { Precedent, Situation, TraitKey } from "./types";

/** The five trait dimensions a precedent can be essential on, in a fixed order. */
export const TRAIT_KEYS: TraitKey[] = [
  "act",
  "justification",
  "power",
  "subject",
  "actor",
];

function traitValue(
  source: Pick<
    Precedent,
    "act" | "justification" | "power" | "subject" | "actorId"
  >,
  key: TraitKey,
): string {
  switch (key) {
    case "act":
      return source.act;
    case "justification":
      return source.justification;
    case "power":
      return source.power;
    case "subject":
      return source.subject;
    case "actor":
      return source.actorId;
  }
}

function situationTraitValue(situation: Situation, key: TraitKey): string {
  return traitValue(
    {
      act: situation.act,
      justification: situation.justification,
      power: situation.power,
      subject: situation.subject,
      actorId: situation.actorId,
    },
    key,
  );
}

/** Does the situation share every one of the given traits with the precedent? */
export function traitsMatch(
  precedent: Precedent,
  situation: Situation,
  keys: TraitKey[],
): boolean {
  return keys.every(
    (key) => traitValue(precedent, key) === situationTraitValue(situation, key),
  );
}

/** All trait keys where the precedent and the situation differ. */
export function traitDifferences(
  precedent: Precedent,
  situation: Situation,
): TraitKey[] {
  return TRAIT_KEYS.filter(
    (key) => traitValue(precedent, key) !== situationTraitValue(situation, key),
  );
}
