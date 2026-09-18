/**
 * פרק 3 — הכלל שלך נגדך.
 *
 * Unlike Chapters 1–2, all four situations here are retrospective — the
 * chapter's whole point (design doc §9.3, one line) is that an *existing*
 * rule now lands on the child themselves or on a character they're fond of.
 * No new subject is introduced; only one new rule gets written (c3s3), and
 * it's framed honestly up front so the child knows they'll be affected by
 * what they write there too (§2 — never a trick, never says they were wrong).
 *
 * c3s1/c3s4 use `actorId: "you"` — see CHILD_ACTOR in content/village.ts for
 * why that's a separate export, not part of ACTORS.
 */

import { t } from "@/content/tokens";
import type { Situation } from "@/engine/types";

export const CHAPTER_3_TITLE = t("chapter3.title");

export const CHAPTER_3_INTRO = t("chapter3.intro");

export const CHAPTER_3: Situation[] = [
  {
    id: "c3s1",
    chapter: 3,
    title: t("chapter3.c3s1.title"),
    speakerGroup: "vatikim",
    text: t("chapter3.c3s1.text"),
    subject: "mayim",
    act: "took-without-asking",
    justification: "needed-more",
    power: "equal",
    actorId: "you",
    victimId: "yotam",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: false,
    lesson: t("chapter3.c3s1.lesson"),
    noRuleOutcome: {
      text: t("chapter3.c3s1.no_rule_outcome"),
      rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter3.c3s1.override_outcome"),
      rights: [{ protection: "shivyon", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter3.c3s1.outcomes.ask_first"),
        rights: [],
        trust: [{ group: "vatikim", delta: 1 }],
      },
      forbidden: {
        text: t("chapter3.c3s1.outcomes.forbidden"),
        rights: [],
        trust: [{ group: "vatikim", delta: 1 }],
      },
      "by-turn": {
        text: t("chapter3.c3s1.outcomes.by_turn"),
        rights: [],
        trust: [{ group: "vatikim", delta: 1 }],
      },
      "share-equally": {
        text: t("chapter3.c3s1.outcomes.share_equally"),
        rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
        trust: [{ group: "vatikim", delta: -1 }],
      },
    },
  },

  {
    id: "c3s2",
    chapter: 3,
    title: t("chapter3.c3s2.title"),
    speakerGroup: "banaim",
    text: t("chapter3.c3s2.text"),
    subject: "shvil",
    act: "blocked",
    justification: "needed-more",
    power: "equal",
    actorId: "shira",
    victimId: "barak",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: false,
    lesson: t("chapter3.c3s2.lesson"),
    noRuleOutcome: {
      text: t("chapter3.c3s2.no_rule_outcome"),
      rights: [{ protection: "shayachut", group: "yeladim", move: "strain" }],
      trust: [{ group: "yeladim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter3.c3s2.override_outcome"),
      rights: [{ protection: "shivyon", group: "yeladim", move: "strain" }],
      trust: [{ group: "yeladim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter3.c3s2.outcomes.ask_first"),
        rights: [],
        trust: [{ group: "banaim", delta: 1 }],
      },
      forbidden: {
        text: t("chapter3.c3s2.outcomes.forbidden"),
        rights: [{ protection: "halich", group: "yeladim", move: "strain" }],
        trust: [
          { group: "banaim", delta: 1 },
          { group: "yeladim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter3.c3s2.outcomes.by_turn"),
        rights: [],
        trust: [{ group: "banaim", delta: 0 }],
      },
      "share-equally": {
        text: t("chapter3.c3s2.outcomes.share_equally"),
        rights: [],
        trust: [
          { group: "banaim", delta: 1 },
          { group: "yeladim", delta: 0 },
        ],
      },
    },
  },

  {
    id: "c3s3",
    chapter: 3,
    title: t("chapter3.c3s3.title"),
    speakerGroup: "roim",
    text: t("chapter3.c3s3.text"),
    subject: "chefetz",
    act: "refused-to-share",
    justification: "was-mine-first",
    power: "equal",
    actorId: "barak",
    victimId: "dana",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: true,
    lesson: t("chapter3.c3s3.lesson"),
    noRuleOutcome: {
      text: t("chapter3.c3s3.no_rule_outcome"),
      rights: [{ protection: "kinyan", group: "roim", move: "strain" }],
      trust: [{ group: "roim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter3.c3s3.override_outcome"),
      rights: [{ protection: "shivyon", group: "roim", move: "strain" }],
      trust: [{ group: "roim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter3.c3s3.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "roim", delta: 1 },
          { group: "banaim", delta: 0 },
        ],
      },
      forbidden: {
        text: t("chapter3.c3s3.outcomes.forbidden"),
        rights: [],
        trust: [
          { group: "roim", delta: 1 },
          { group: "banaim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter3.c3s3.outcomes.by_turn"),
        rights: [],
        trust: [{ group: "roim", delta: 0 }],
      },
      "share-equally": {
        text: t("chapter3.c3s3.outcomes.share_equally"),
        rights: [{ protection: "kinyan", group: "banaim", move: "strain" }],
        trust: [
          { group: "roim", delta: 1 },
          { group: "banaim", delta: -1 },
        ],
      },
    },
  },

  {
    id: "c3s4",
    chapter: 3,
    title: t("chapter3.c3s4.title"),
    speakerGroup: "hadashim",
    text: t("chapter3.c3s4.text"),
    subject: "chefetz",
    act: "refused-to-share",
    justification: "needed-more",
    power: "equal",
    actorId: "you",
    victimId: "michal",
    scarce: false,
    someoneHarmed: true,
    firstOffence: false,
    invitesRule: false,
    lesson: t("chapter3.c3s4.lesson"),
    noRuleOutcome: {
      text: t("chapter3.c3s4.no_rule_outcome"),
      rights: [{ protection: "shayachut", group: "hadashim", move: "strain" }],
      trust: [{ group: "hadashim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter3.c3s4.override_outcome"),
      rights: [{ protection: "shivyon", group: "hadashim", move: "strain" }],
      trust: [{ group: "hadashim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter3.c3s4.outcomes.ask_first"),
        rights: [],
        trust: [{ group: "hadashim", delta: 1 }],
      },
      forbidden: {
        text: t("chapter3.c3s4.outcomes.forbidden"),
        rights: [],
        trust: [{ group: "hadashim", delta: 1 }],
      },
      "by-turn": {
        text: t("chapter3.c3s4.outcomes.by_turn"),
        rights: [],
        trust: [{ group: "hadashim", delta: 1 }],
      },
      "share-equally": {
        text: t("chapter3.c3s4.outcomes.share_equally"),
        rights: [],
        trust: [{ group: "hadashim", delta: 1 }],
      },
    },
  },
];
