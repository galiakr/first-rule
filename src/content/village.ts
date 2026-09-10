import { t } from "@/content/tokens";
import type { Actor, GroupId } from "@/engine/types";

export const GROUP_BLURB: Record<GroupId, string> = {
  vatikim: t("village.groups.vatikim.blurb"),
  hadashim: t("village.groups.hadashim.blurb"),
  roim: t("village.groups.roim.blurb"),
  banaim: t("village.groups.banaim.blurb"),
  yeladim: t("village.groups.yeladim.blurb"),
  ovrim: t("village.groups.ovrim.blurb"),
};

/**
 * The screen before the village opens (§4). Names the six groups by what
 * moves them, not by role — and says what the child's own role is not:
 * nobody appointed it.
 */
export const ABOUT_TITLE = t("about.title");

export const ABOUT_VILLAGE_TEXT = t("about.village_text");

export const ABOUT_ME_TEXT = t("about.me_text");

export const ACTORS: Record<string, Actor> = {
  yotam: {
    id: "yotam",
    name: "יותם",
    groups: ["vatikim"],
    resident: true,
  },
  dana: {
    id: "dana",
    name: "דנה",
    groups: ["roim"],
    resident: true,
  },
  shira: {
    id: "shira",
    // A child, and the one who brings you water every morning.
    // Situation 3 exists to make her the one the rule bites.
    name: "שירה",
    groups: ["yeladim", "roim"],
    resident: true,
  },
  barak: {
    id: "barak",
    name: "ברק",
    groups: ["banaim"],
    resident: true,
  },
  michal: {
    id: "michal",
    name: "מיכל",
    groups: ["hadashim"],
    resident: true,
  },
  noam: {
    id: "noam",
    name: "נעם",
    groups: ["ovrim"],
    resident: false,
  },
};

export function actor(id: string): Actor {
  const a = ACTORS[id];
  if (!a) throw new Error(`Unknown actor: ${id}`);
  return a;
}
