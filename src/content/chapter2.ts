/**
 * פרק 2 — זה כבר קרה.
 *
 * Situations 1–2 are fresh cases (§9) that introduce subjects untouched by
 * Chapter 1 — chefetz (a personal object) and davar (something told in
 * confidence) — and invite new rules. Situations 3–4 are both subject
 * shetach (land), untouched by any rule anywhere in the game so far, on
 * purpose: it guarantees the precedent path in game.ts's promptFor is
 * actually reachable regardless of what the child wrote in Chapter 1 (a
 * mayim rule almost always exists by now and would otherwise shadow it).
 *
 * c2s3 and c2s4 both set precedentOf: "c1s2" — the SAME source situation —
 * not a chain. c2s3 is where the child is first asked what determined their
 * c1s2 ruling; c2s4 checks that same precedent's essentialTraits against a
 * case that shares one of the two candidate traits (act) but not the other
 * (power). Which branch fires at c2s4 genuinely depends on what the child
 * picked at c2s3 — that dependency is the point, not something to avoid.
 */

import { t } from "@/content/tokens";
import type { Situation } from "@/engine/types";

export const CHAPTER_2_TITLE = t("chapter2.title");

export const CHAPTER_2_INTRO = t("chapter2.intro");

export const CHAPTER_2: Situation[] = [
  {
    id: "c2s1",
    chapter: 2,
    title: t("chapter2.c2s1.title"),
    speakerGroup: "hadashim",
    text: t("chapter2.c2s1.text"),
    subject: "chefetz",
    act: "took-without-asking",
    justification: "meant-to-return",
    power: "victim-weaker",
    actorId: "barak",
    victimId: "michal",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: true,
    lesson: t("chapter2.c2s1.lesson"),
    noRuleOutcome: {
      text: t("chapter2.c2s1.no_rule_outcome"),
      rights: [{ protection: "kinyan", group: "hadashim", move: "strain" }],
      trust: [{ group: "hadashim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter2.c2s1.override_outcome"),
      rights: [{ protection: "shivyon", group: "hadashim", move: "strain" }],
      trust: [{ group: "hadashim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter2.c2s1.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "banaim", delta: 0 },
        ],
      },
      forbidden: {
        text: t("chapter2.c2s1.outcomes.forbidden"),
        rights: [],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "banaim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter2.c2s1.outcomes.by_turn"),
        rights: [],
        trust: [
          { group: "hadashim", delta: 0 },
          { group: "banaim", delta: 0 },
        ],
      },
      "share-equally": {
        text: t("chapter2.c2s1.outcomes.share_equally"),
        rights: [{ protection: "kinyan", group: "hadashim", move: "strain" }],
        trust: [
          { group: "hadashim", delta: -1 },
          { group: "banaim", delta: 1 },
        ],
      },
    },
  },

  {
    id: "c2s2",
    chapter: 2,
    title: t("chapter2.c2s2.title"),
    speakerGroup: "vatikim",
    text: t("chapter2.c2s2.text"),
    subject: "davar",
    act: "told-what-was-private",
    justification: "everyone-does-it",
    power: "equal",
    actorId: "dana",
    victimId: "yotam",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: true,
    lesson: t("chapter2.c2s2.lesson"),
    noRuleOutcome: {
      text: t("chapter2.c2s2.no_rule_outcome"),
      rights: [{ protection: "bitui", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter2.c2s2.override_outcome"),
      rights: [{ protection: "shivyon", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter2.c2s2.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 1 },
          { group: "roim", delta: 0 },
        ],
      },
      forbidden: {
        text: t("chapter2.c2s2.outcomes.forbidden"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 1 },
          { group: "roim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter2.c2s2.outcomes.by_turn"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 0 },
          { group: "roim", delta: 0 },
        ],
      },
      "share-equally": {
        text: t("chapter2.c2s2.outcomes.share_equally"),
        rights: [{ protection: "bitui", group: "vatikim", move: "strain" }],
        trust: [
          { group: "vatikim", delta: -1 },
          { group: "roim", delta: 1 },
        ],
      },
    },
  },

  {
    id: "c2s3",
    chapter: 2,
    title: t("chapter2.c2s3.title"),
    speakerGroup: "hadashim",
    text: t("chapter2.c2s3.text"),
    subject: "shetach",
    act: "blocked",
    justification: "was-mine-first",
    power: "victim-weaker",
    actorId: "yotam",
    victimId: "michal",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: false,
    precedentOf: "c1s2",
    precedentOptions: [
      { traits: ["act"], label: t("chapter2.c2s3.precedent_option_act") },
      { traits: ["power"], label: t("chapter2.c2s3.precedent_option_power") },
    ],
    lesson: t("chapter2.c2s3.lesson"),
    noRuleOutcome: {
      text: t("chapter2.c2s3.no_rule_outcome"),
      rights: [{ protection: "shayachut", group: "hadashim", move: "strain" }],
      trust: [{ group: "hadashim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter2.c2s3.override_outcome"),
      rights: [{ protection: "shivyon", group: "hadashim", move: "strain" }],
      trust: [{ group: "hadashim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter2.c2s3.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "vatikim", delta: 0 },
        ],
      },
      forbidden: {
        text: t("chapter2.c2s3.outcomes.forbidden"),
        rights: [],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "vatikim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter2.c2s3.outcomes.by_turn"),
        rights: [],
        trust: [
          { group: "hadashim", delta: 0 },
          { group: "vatikim", delta: 0 },
        ],
      },
      "share-equally": {
        text: t("chapter2.c2s3.outcomes.share_equally"),
        rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "vatikim", delta: -1 },
        ],
      },
    },
  },

  {
    id: "c2s4",
    chapter: 2,
    title: t("chapter2.c2s4.title"),
    speakerGroup: "vatikim",
    text: t("chapter2.c2s4.text"),
    subject: "shetach",
    act: "blocked",
    justification: "needed-more",
    power: "equal",
    actorId: "barak",
    victimId: "yotam",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: false,
    precedentOf: "c1s2",
    lesson: t("chapter2.c2s4.lesson"),
    noRuleOutcome: {
      text: t("chapter2.c2s4.no_rule_outcome"),
      rights: [{ protection: "shayachut", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    overrideOutcome: {
      text: t("chapter2.c2s4.override_outcome"),
      rights: [{ protection: "shivyon", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text: t("chapter2.c2s4.outcomes.ask_first"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 1 },
          { group: "banaim", delta: 0 },
        ],
      },
      forbidden: {
        text: t("chapter2.c2s4.outcomes.forbidden"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 1 },
          { group: "banaim", delta: -1 },
        ],
      },
      "by-turn": {
        text: t("chapter2.c2s4.outcomes.by_turn"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 0 },
          { group: "banaim", delta: 0 },
        ],
      },
      "share-equally": {
        text: t("chapter2.c2s4.outcomes.share_equally"),
        rights: [],
        trust: [
          { group: "vatikim", delta: 0 },
          { group: "banaim", delta: 0 },
        ],
      },
    },
  },
];
