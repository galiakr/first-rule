/**
 * Who decides who decides (design doc §9.5).
 *
 * The child has been ruling all game without anything appointing them to it
 * (§4). This is where that gets settled — by a rule that, like every other
 * rule they have written, also applies to them.
 *
 * Pure and deterministic. The election has no randomness in it at all: every
 * vote traces back to a trust level the child earned or burned over the four
 * chapters before this one. That is the whole point of having kept trust
 * hidden until now.
 */

import { GROUPS, trustLevel } from "./rights";
import type {
  AuthorityForm,
  AuthorityRule,
  Decider,
  Election,
  GameState,
  GroupId,
  RuleWho,
} from "./types";

/**
 * העוברים are the one group that doesn't live in the village (§4), so they
 * are the one group a `residents` scope leaves out of the vote. This is the
 * hook back into chapter 6's question: the WHO field the child picks here
 * decides who has a voice in choosing who rules.
 */
const NON_RESIDENT_GROUPS: GroupId[] = ["ovrim"];

/** Which groups the authority rule's WHO field gives a vote to. */
export function eligibleGroups(who: RuleWho): GroupId[] {
  switch (who.scope) {
    case "residents":
      return GROUPS.filter((g) => !NON_RESIDENT_GROUPS.includes(g));
    case "anyone-present":
      return [...GROUPS];
    case "group":
      return who.group ? [who.group] : [];
    case "everyone-except":
      return GROUPS.filter((g) => g !== who.group);
  }
}

/**
 * One round of voting (§9: one round, no campaign, no promises).
 *
 * Each eligible group votes the way it already behaves toward the child:
 * a group that comes to you first is for you, one that has stopped coming is
 * against, and one that comes but only tells you half abstains — present,
 * not persuaded.
 *
 * A tie keeps the child in place. Nobody voted them out, and a tie is not a
 * mandate to replace an incumbent; losing should have to be earned, the same
 * way the trust behind it was.
 */
export function runElection(state: GameState, who: RuleWho): Election {
  const eligible = eligibleGroups(who);
  const by = (level: string) =>
    eligible.filter((g) => trustLevel(state.trust[g]) === level);

  const votedFor = by("comes-to-you");
  const votedAgainst = by("stops-coming");
  const abstained = by("comes-but");

  return {
    eligible,
    votedFor,
    votedAgainst,
    abstained,
    won: votedFor.length >= votedAgainst.length,
  };
}

/**
 * Who ends up ruling under a given form.
 *
 * `most-senior` hands it away: the most senior person in the village is
 * יותם, not the child, so choosing it is choosing to stop deciding.
 * `each-alone` keeps the child nominally in place — nobody decides for
 * anybody, which costs the village plenty, but it costs it in the outcomes
 * rather than by moving the role.
 */
export function deciderFor(
  form: AuthorityForm,
  election: Election | null,
): Decider {
  switch (form) {
    case "most-senior":
      return "other";
    case "village-chooses":
      return election?.won ? "you" : "other";
    case "you":
    case "two-together":
    case "each-alone":
      return "you";
  }
}

/** Writes the authority rule, running the election if that is what it says. */
export function setAuthority(
  state: GameState,
  authority: AuthorityRule,
): GameState {
  const election =
    authority.form === "village-chooses"
      ? runElection(state, authority.who)
      : null;

  return {
    ...state,
    authority,
    election,
    decider: deciderFor(authority.form, election),
  };
}

/**
 * The variant key chapter 5's situations branch their outcomes on — the form
 * that was written, with the election's result folded in, since winning and
 * losing the same vote are two different situations to live through.
 */
export function authorityVariant(state: GameState): string | undefined {
  if (!state.authority) return undefined;
  if (state.authority.form === "village-chooses") {
    return state.election?.won ? "village-chooses-won" : "village-chooses-lost";
  }
  return state.authority.form;
}

/**
 * The keys a chapter-5 situation may branch its outcome on, most specific
 * first: which authority form was written (with the election folded in,
 * since winning and losing the same vote are different things to live
 * through), then simply whether the child still decides.
 */
export function variantKeys(state: GameState): string[] {
  const keys: string[] = [];
  const form = authorityVariant(state);
  if (form) keys.push(form);
  // Simply that the line now exists, whatever it says — c5s2 turns on that
  // and not on which form was chosen, which is c5s3's business.
  if (state.authority) keys.push("authority-written");
  keys.push(state.decider === "you" ? "you-decide" : "other-decides");
  return keys;
}

/** Can the child still go against a rule that applies? Not once they lost. */
export function canOverride(state: GameState): boolean {
  return state.decider === "you";
}

/** Closes the book (§10). Nothing may be written into it afterwards. */
export function closeBook(
  state: GameState,
  amendment: GameState["amendment"],
): GameState {
  return { ...state, amendment, bookClosed: true };
}
