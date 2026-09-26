/**
 * The three jobs, and who guards the book (design doc §9.6).
 *
 * The child has been legislating, judging and enforcing for five chapters
 * without anyone naming it. This is where the game replays three of their own
 * moments back to them, puts a word on each, and then asks who should hold
 * them from here.
 *
 * Staffing is the *village's* act, not the decider's: appointing who guards
 * the book is constitutional, not day-to-day, so a child who lost chapter 5's
 * election still assigns the jobs. The village turns to them because they are
 * the one who wrote the book.
 */

import { groupLabel } from "./options";
import { applyRights, applyTrust, GROUPS, trustLevel } from "./rights";
import { translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";
import type {
  Actor,
  GameState,
  GroupId,
  Holder,
  Job,
  KeyMoment,
  ResolutionKind,
  Separation,
} from "./types";

export const JOBS: Job[] = ["legislative", "judicial", "executive"];

/** Which log kinds count as having done each job. */
const KINDS_BY_JOB: Record<Job, ResolutionKind[]> = {
  legislative: ["wrote-rule", "wrote-authority"],
  judicial: ["ruled-by-precedent", "chose-in-collision"],
  // Enforcing a rule as written — making sure the thing actually happened.
  // Going against one is not executing it, it is §7's subject instead.
  executive: ["applied-rule"],
};

/**
 * Three moments out of the child's own game, one per job.
 *
 * The *first* of each kind, not the most recent: "you did this before you
 * knew what it was called" is the whole point of the opening.
 *
 * A job the child never once did comes back with a null situation rather
 * than a substitute. The game says so in-world instead of inventing a moment
 * — §2 forbids telling the child something about themselves that isn't true.
 */
export function keyMoments(state: GameState): KeyMoment[] {
  return JOBS.map((job) => {
    const entry = state.log.find((e) => KINDS_BY_JOB[job].includes(e.kind));
    return {
      job,
      situationId: entry?.situationId ?? null,
      kind: entry?.kind ?? null,
    };
  });
}

/**
 * Which group the village would pick, if a slot is left to it.
 *
 * Whichever group trusts the child most, ties broken by the order in GROUPS.
 * Chapter 5 already spent a chapter on a vote; running three more here would
 * repeat that beat rather than build on it, and this is the same idea —
 * trust is the village's voice — without the ceremony.
 */
export function villageChoice(state: GameState): GroupId {
  return GROUPS.reduce((best, g) =>
    state.trust[g] > state.trust[best] ? g : best,
  );
}

/** Who actually holds a slot right now, with "village" resolved. */
export function resolveHolder(state: GameState, holder: Holder): Holder {
  if (holder.kind !== "village") return holder;
  return { kind: "group", groupId: villageChoice(state) };
}

/** Does the child still hold this job themselves? */
export function heldByYou(state: GameState, job: Job): boolean {
  return state.separation?.[job].kind === "you";
}

/** True when the child kept both writing the rules and judging by them. */
export function keptWritingAndJudging(state: GameState): boolean {
  return heldByYou(state, "legislative") && heldByYou(state, "judicial");
}

export function assignSeparation(
  state: GameState,
  separation: Separation,
): GameState {
  return { ...state, separation };
}

/**
 * Tearing the arrangement up (§9.6: "loses everything he built").
 *
 * Every job comes back to the child, every group stops coming, and fair
 * process is strained for whoever had been appointed to judge — revoking an
 * arrangement because it ruled against you is precisely the denial of it.
 *
 * This is the one consequence in the game computed rather than authored:
 * which group it lands on depends on who was appointed, and static content
 * cannot know that.
 */
export function revokeSeparation(state: GameState): GameState {
  const judge = state.separation
    ? resolveHolder(state, state.separation.judicial)
    : null;

  return {
    ...state,
    separation: {
      legislative: { kind: "you" },
      judicial: { kind: "you" },
      executive: { kind: "you" },
    },
    trust: applyTrust(
      state.trust,
      GROUPS.map((group) => ({ group, delta: -3 })),
    ),
    rights:
      judge?.kind === "group"
        ? applyRights(state.rights, [
            { protection: "halich", group: judge.groupId, move: "strain" },
          ])
        : state.rights,
  };
}

/** The variant keys chapter 6's situations branch their outcomes on. */
export function separationVariants(state: GameState): string[] {
  if (!state.separation) return [];
  return [
    keptWritingAndJudging(state) ? "kept-together" : "split",
    heldByYou(state, "judicial") ? "you-judge" : "other-judges",
    heldByYou(state, "executive") ? "you-enforce" : "other-enforces",
  ];
}

/** Has every group stopped coming? Used to tell the revoke ending apart. */
export function villageHasWithdrawn(state: GameState): boolean {
  return GROUPS.every((g) => trustLevel(state.trust[g]) === "stops-coming");
}

/** How a staffed job reads: "you", a name, a group, or the village's pick. */
export function holderLabel(
  state: GameState,
  holder: Holder,
  lang: Lang,
  actors: Record<string, Actor>,
): string {
  const t = translator(lang);
  const labels = groupLabel(lang);
  switch (holder.kind) {
    case "you":
      return t("staffing.held_by_you");
    case "actor":
      return actors[holder.actorId]?.name ?? holder.actorId;
    case "group":
      return labels[holder.groupId];
    case "village":
      return t("staffing.held_by_village", {
        group: labels[villageChoice(state)],
      });
  }
}
