/**
 * Changing what's already written (design doc §9.7).
 *
 * A rule in the book has started to hurt, and this time it is the child who
 * wants it gone. They cannot simply delete it: they go down the same path
 * they set for everybody else, using the amendment rule they wrote at the end
 * of chapter 5 without knowing they would be the one who needed it.
 *
 * That veil is the whole point, so nothing here is a special case for the
 * child. The four behaviours are just the four forms doing what they say.
 */

import { GROUPS, trustLevel } from "./rights";
import type { AmendmentResult, GameState, GroupId, Rule } from "./types";

/**
 * Swaps one rule for a rewritten version, in place. Used both by chapter 5's
 * closing ceremony (§10, the one rule the child may change before the book
 * shuts) and by every path in this file. Order and length are kept, so the
 * book still reads as the history of what was decided and when.
 */
export function replaceRule(
  state: GameState,
  ruleId: string,
  next: Rule,
): GameState {
  return {
    ...state,
    rules: state.rules.map((r) =>
      r.id === ruleId
        ? // A rule's subject is inherited from the situation that produced it
          // and is never chosen (§6), so rewriting one may change its four
          // clauses and nothing else. Same for where it came from: the book
          // reads as a history, and history does not get edited.
          { ...next, id: r.id, subject: r.subject, writtenAt: r.writtenAt }
        : r,
    ),
  };
}

/**
 * Which rule the child is trying to change.
 *
 * The one that just bit them, if one did — that is the rule they have a
 * reason to want changed, and the game should not have to guess. Otherwise
 * the oldest rule in the book: the one they least remember choosing.
 *
 * Null when the book is empty. A child who wrote nothing all game has
 * nothing to change here, and the chapter says so rather than inventing a
 * rule for them to resent.
 */
export function amendmentTarget(
  state: GameState,
  situationId: string,
): Rule | null {
  const bit = state.log.find((e) => e.situationId === situationId);
  const fired = bit?.appliedRuleIds[0];
  if (fired) {
    const rule = state.rules.find((r) => r.id === fired);
    if (rule) return rule;
  }
  return state.rules[0] ?? null;
}

/**
 * Who has to agree, under "two people have to agree".
 *
 * The rule protects somebody, and that somebody is who the child has to
 * persuade — not necessarily who would be convenient (§9.7). Resolved in
 * order: the group the rule's own WHO field points at, then the group the
 * situation names as having a stake in it, then whoever trusts the child
 * least.
 *
 * The authored middle case matters. Most rules are scoped to residents and
 * name no group, and falling straight through to "least trusting" would make
 * this branch refuse nearly every time — after two dozen situations some
 * group has always slipped. The content says who is on the other side of the
 * specific rule at issue, which is both truer and winnable.
 */
export function mustAgree(
  state: GameState,
  rule: Rule,
  stakeholder?: GroupId,
): GroupId {
  if (rule.who.group) return rule.who.group;
  if (stakeholder) return stakeholder;
  return GROUPS.reduce((worst, g) =>
    state.trust[g] < state.trust[worst] ? g : worst,
  );
}

/**
 * The child's one attempt at changing a rule.
 *
 * Trust decides the "two must agree" branch, the same way it decided the
 * election and the village's pick: a group that still comes to you will hear
 * you out, one that has stopped coming will not. One round, one answer — a
 * refusal is final, like the vote in chapter 5.
 *
 * No amendment rule at all means nothing in the book says a rule may be
 * changed, so it cannot be. Reachable only if the book was closed without
 * one, which the closing ceremony does not allow.
 */
export function attemptAmendment(
  state: GameState,
  rule: Rule,
  stakeholder?: GroupId,
): AmendmentResult {
  switch (state.amendment) {
    case "author":
      return "applied";
    case "two-agree":
      return trustLevel(state.trust[mustAgree(state, rule, stakeholder)]) ===
        "comes-to-you"
        ? "applied"
        : "refused-no-agreement";
    case "whole-village":
      return "delayed";
    case "cannot":
    case null:
      return "refused-unchangeable";
  }
}

/** Carries out whatever the attempt came to, and records the one attempt. */
export function applyAmendment(
  state: GameState,
  rule: Rule,
  next: Rule,
  result: AmendmentResult,
  situationId: string,
): GameState {
  const spent: GameState = { ...state, amendmentResult: result };
  switch (result) {
    case "applied":
      return replaceRule(spent, rule.id, next);
    case "delayed":
      return {
        ...spent,
        pendingAmendment: { ruleId: rule.id, next, appliesAfter: situationId },
      };
    case "refused-no-agreement":
    case "refused-unchangeable":
      return spent;
  }
}

/**
 * The rule somebody else changes to make the point (§9.7).
 *
 * Under "whoever wrote it may change it", one person changing something in a
 * second means *any* one person can, and the chapter shows that rather than
 * saying it. The oldest other rule stings most: it is the one the village has
 * been living by longest.
 */
export function demonstrationTarget(
  state: GameState,
  exceptRuleId: string,
): Rule | null {
  return state.rules.find((r) => r.id !== exceptRuleId) ?? null;
}

/** Somebody else exercising the same power, on the child's oldest rule. */
export function demonstrateAmendment(
  state: GameState,
  exceptRuleId: string,
): GameState {
  const target = demonstrationTarget(state, exceptRuleId);
  if (!target) return state;
  return replaceRule(state, target.id, { ...target, what: "forbidden" });
}

/**
 * Lands a change the whole village agreed to, once the delay has elapsed.
 * Called by `resolve()`; the situation inside the delay is where someone
 * gets hurt waiting, which is what that form costs.
 */
export function applyPendingAmendment(
  state: GameState,
  justResolved: string,
): GameState {
  const pending = state.pendingAmendment;
  if (!pending || pending.appliesAfter !== justResolved) return state;
  return {
    ...replaceRule(state, pending.ruleId, pending.next),
    pendingAmendment: null,
  };
}

/**
 * The keys chapter 7's situations branch their outcomes on, most specific
 * first. Changing a rule because you alone may, and changing it because you
 * persuaded somebody, end in the same book and are not the same thing to
 * have done — so they are separate keys.
 */
export function amendmentVariants(state: GameState): string[] {
  const result = state.amendmentResult;
  if (!result) return ["not-attempted"];
  if (result === "applied") {
    return state.amendment === "author"
      ? ["applied-author", "applied"]
      : ["applied-agreed", "applied"];
  }
  return [result];
}
