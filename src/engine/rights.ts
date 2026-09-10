/**
 * Rights are not points (§8). Each protection sits in one of three states for
 * one named group, and a broken protection can be repaired by a later rule.
 *
 * Trust is a number internally and never a number on screen (§7). It surfaces
 * only as one of three ways a group behaves toward the child.
 */

import { t } from "@/content/tokens";

import type {
  GroupId,
  Protection,
  ProtectionState,
  RightsBoard,
  RightsEffect,
  TrustEffect,
  TrustLevel,
} from "./types";

export const PROTECTIONS: Protection[] = [
  "kinyan",
  "bitui",
  "shivyon",
  "machse",
  "halich",
  "shayachut",
];

export const PROTECTION_LABEL: Record<Protection, string> = {
  kinyan: t("rights.protections.kinyan"),
  bitui: t("rights.protections.bitui"),
  shivyon: t("rights.protections.shivyon"),
  machse: t("rights.protections.machse"),
  halich: t("rights.protections.halich"),
  shayachut: t("rights.protections.shayachut"),
};

export const GROUPS: GroupId[] = [
  "vatikim",
  "hadashim",
  "roim",
  "banaim",
  "yeladim",
  "ovrim",
];

export const STATE_LABEL: Record<ProtectionState, string> = {
  intact: t("rights.states.intact"),
  strained: t("rights.states.strained"),
  broken: t("rights.states.broken"),
};

export function rightsKey(protection: Protection, group: GroupId): string {
  return `${protection}:${group}`;
}

export function emptyRightsBoard(): RightsBoard {
  const board: RightsBoard = {};
  for (const p of PROTECTIONS) {
    for (const g of GROUPS) {
      board[rightsKey(p, g)] = "intact";
    }
  }
  return board;
}

function nextState(
  current: ProtectionState,
  move: RightsEffect["move"],
): ProtectionState {
  switch (move) {
    case "strain":
      // Straining something already broken does not quietly heal it.
      return current === "broken" ? "broken" : "strained";
    case "break":
      return "broken";
    case "repair":
      return "intact";
  }
}

export function applyRights(
  board: RightsBoard,
  effects: RightsEffect[],
): RightsBoard {
  const next = { ...board };
  for (const e of effects) {
    const key = rightsKey(e.protection, e.group);
    next[key] = nextState(next[key] ?? "intact", e.move);
  }
  return next;
}

/** Everything not intact, for the end-of-chapter reveal. */
export function harmed(
  board: RightsBoard,
): { protection: Protection; group: GroupId; state: ProtectionState }[] {
  const out: {
    protection: Protection;
    group: GroupId;
    state: ProtectionState;
  }[] = [];
  for (const p of PROTECTIONS) {
    for (const g of GROUPS) {
      const state = board[rightsKey(p, g)];
      if (state && state !== "intact") {
        out.push({ protection: p, group: g, state });
      }
    }
  }
  // Broken first — that is what the child should read at the top.
  return out.sort((a, b) =>
    a.state === b.state ? 0 : a.state === "broken" ? -1 : 1,
  );
}

/* ---- trust ---- */

export const TRUST_START = 2;
const TRUST_MIN = 0;
const TRUST_MAX = 3;

export function emptyTrust(): Record<GroupId, number> {
  return GROUPS.reduce(
    (acc, g) => {
      acc[g] = TRUST_START;
      return acc;
    },
    {} as Record<GroupId, number>,
  );
}

export function applyTrust(
  trust: Record<GroupId, number>,
  effects: TrustEffect[],
): Record<GroupId, number> {
  const next = { ...trust };
  for (const e of effects) {
    const value = (next[e.group] ?? TRUST_START) + e.delta;
    next[e.group] = Math.max(TRUST_MIN, Math.min(TRUST_MAX, value));
  }
  return next;
}

/** The only thing the interface is allowed to know about trust. */
export function trustLevel(value: number): TrustLevel {
  if (value >= 2) return "comes-to-you";
  if (value === 1) return "comes-but";
  return "stops-coming";
}
