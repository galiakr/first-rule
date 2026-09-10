/**
 * פרק 1 — אין כללים.
 *
 * Four situations (§9). The first two present a gap and invite a rule; the
 * third and fourth collide with whatever was written. Situation 3 is the
 * chapter's pinch: the rule lands on שירה, who brings the child water every
 * morning. Situation 4 turns a path rule against a shelter someone needs.
 *
 * All copy here comes from the language tokens (src/content/tokens) — see
 * tokens.csv for the chapter1.* keys.
 */

import { t } from "@/content/tokens";
import type { Situation } from "@/engine/types";

export const CHAPTER_1_TITLE = t("chapter1.title");

export const CHAPTER_1_INTRO = t("chapter1.intro");

export const CHAPTER_1: Situation[] = [
  {
    id: "c1s1",
    chapter: 1,
    title: t("chapter1.c1s1.title"),
    speakerGroup: "vatikim",
    text: t("chapter1.c1s1.text"),
    subject: "mayim",
    act: "took-without-asking",
    justification: "needed-more",
    power: "victim-stronger",
    actorId: "dana",
    victimId: "yotam",
    scarce: false,
    someoneHarmed: false,
    firstOffence: true,
    invitesRule: true,
    lesson: t("chapter1.c1s1.lesson"),
    noRuleOutcome: {
      text: t("chapter1.c1s1.no_rule_outcome"),
      rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
      trust: [
        { group: "vatikim", delta: -1 },
        { group: "roim", delta: 0 },
      ],
    },
    overrideOutcome: {
      text: t("chapter1.c1s1.override_outcome"),
      rights: [{ protection: "shivyon", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter1.c1s1.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 1 },
          { group: "roim", delta: 0 },
        ],
      },
      forbidden: {
        text: t("chapter1.c1s1.outcomes.forbidden"),
        rights: [{ protection: "shayachut", group: "roim", move: "strain" }],
        trust: [
          { group: "vatikim", delta: 1 },
          { group: "roim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter1.c1s1.outcomes.by_turn"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 0 },
          { group: "roim", delta: 0 },
        ],
      },
      "share-equally": {
        text: t("chapter1.c1s1.outcomes.share_equally"),
        rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
        trust: [
          { group: "vatikim", delta: -1 },
          { group: "roim", delta: 1 },
        ],
      },
    },
  },

  {
    id: "c1s2",
    chapter: 1,
    title: t("chapter1.c1s2.title"),
    speakerGroup: "yeladim",
    text: t("chapter1.c1s2.text"),
    subject: "shvil",
    act: "blocked",
    justification: "nobody-said-no",
    power: "victim-weaker",
    actorId: "barak",
    victimId: "shira",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: true,
    lesson: t("chapter1.c1s2.lesson"),
    noRuleOutcome: {
      text: t("chapter1.c1s2.no_rule_outcome"),
      rights: [{ protection: "shayachut", group: "yeladim", move: "strain" }],
      trust: [{ group: "yeladim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter1.c1s2.override_outcome"),
      rights: [{ protection: "shivyon", group: "yeladim", move: "strain" }],
      trust: [{ group: "yeladim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter1.c1s2.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "yeladim", delta: 1 },
          { group: "banaim", delta: -1 },
        ],
      },
      forbidden: {
        text: t("chapter1.c1s2.outcomes.forbidden"),
        rights: [{ protection: "shayachut", group: "banaim", move: "strain" }],
        trust: [
          { group: "yeladim", delta: 1 },
          { group: "banaim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter1.c1s2.outcomes.by_turn"),
        rights: [],
        trust: [{ group: "yeladim", delta: 0 }],
      },
      "share-equally": {
        text: t("chapter1.c1s2.outcomes.share_equally"),
        rights: [],
        trust: [
          { group: "yeladim", delta: 0 },
          { group: "banaim", delta: 0 },
        ],
      },
    },
  },

  {
    id: "c1s3",
    chapter: 1,
    title: t("chapter1.c1s3.title"),
    speakerGroup: "vatikim",
    text: t("chapter1.c1s3.text"),
    subject: "mayim",
    act: "took-without-asking",
    justification: "needed-more",
    power: "equal",
    actorId: "shira",
    victimId: "yotam",
    scarce: true,
    someoneHarmed: true,
    firstOffence: false,
    invitesRule: false,
    lesson: t("chapter1.c1s3.lesson"),
    noRuleOutcome: {
      text: t("chapter1.c1s3.no_rule_outcome"),
      rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter1.c1s3.override_outcome"),
      rights: [
        { protection: "shivyon", group: "vatikim", move: "strain" },
        { protection: "shivyon", group: "yeladim", move: "strain" },
      ],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter1.c1s3.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "yeladim", delta: -1 },
          { group: "vatikim", delta: 1 },
        ],
      },
      forbidden: {
        text: t("chapter1.c1s3.outcomes.forbidden"),
        rights: [{ protection: "shayachut", group: "yeladim", move: "break" }],
        trust: [
          { group: "yeladim", delta: -2 },
          { group: "vatikim", delta: 1 },
        ],
      },
      "by-turn": {
        text: t("chapter1.c1s3.outcomes.by_turn"),
        rights: [{ protection: "shayachut", group: "yeladim", move: "strain" }],
        trust: [
          { group: "yeladim", delta: -1 },
          { group: "vatikim", delta: 1 },
        ],
      },
      "share-equally": {
        text: t("chapter1.c1s3.outcomes.share_equally"),
        rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
        trust: [
          { group: "yeladim", delta: 1 },
          { group: "vatikim", delta: -1 },
        ],
      },
    },
  },

  {
    id: "c1s4",
    chapter: 1,
    title: t("chapter1.c1s4.title"),
    speakerGroup: "hadashim",
    text: t("chapter1.c1s4.text"),
    subject: "shvil",
    act: "blocked",
    justification: "needed-more",
    power: "victim-weaker",
    actorId: "barak",
    victimId: "michal",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: false,
    lesson: t("chapter1.c1s4.lesson"),
    noRuleOutcome: {
      text: t("chapter1.c1s4.no_rule_outcome"),
      rights: [{ protection: "shayachut", group: "yeladim", move: "strain" }],
      trust: [
        { group: "hadashim", delta: 1 },
        { group: "yeladim", delta: -1 },
      ],
    },
    overrideOutcome: {
      text: t("chapter1.c1s4.override_outcome"),
      rights: [{ protection: "shivyon", group: "yeladim", move: "strain" }],
      trust: [
        { group: "hadashim", delta: 1 },
        { group: "yeladim", delta: -1 },
      ],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter1.c1s4.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "banaim", delta: 1 },
        ],
      },
      forbidden: {
        text: t("chapter1.c1s4.outcomes.forbidden"),
        rights: [{ protection: "machse", group: "hadashim", move: "break" }],
        trust: [
          { group: "hadashim", delta: -2 },
          { group: "banaim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter1.c1s4.outcomes.by_turn"),
        rights: [{ protection: "machse", group: "hadashim", move: "strain" }],
        trust: [{ group: "hadashim", delta: -1 }],
      },
      "share-equally": {
        text: t("chapter1.c1s4.outcomes.share_equally"),
        rights: [],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "yeladim", delta: 0 },
        ],
      },
    },
  },
];
