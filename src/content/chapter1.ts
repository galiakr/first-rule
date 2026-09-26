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

import { perLanguage, translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";
import type { Chapter, Situation } from "@/engine/types";

export const chapter1 = perLanguage((lang: Lang): Chapter => {
  const t = translator(lang);
  const situations: Situation[] = [
    {
      id: "c1s1",
      chapter: 1,
      title: t("chapter1.c1s1.title"),
      speakerGroup: "old-timers",
      text: t("chapter1.c1s1.text"),
      subject: "water",
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
        rights: [
          { protection: "property", group: "old-timers", move: "strain" },
        ],
        trust: [
          { group: "old-timers", delta: -1 },
          { group: "shepherds", delta: 0 },
        ],
      },
      overrideOutcome: {
        text: t("chapter1.c1s1.override_outcome"),
        rights: [
          { protection: "equality", group: "old-timers", move: "strain" },
        ],
        trust: [{ group: "old-timers", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter1.c1s1.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "old-timers", delta: 1 },
            { group: "shepherds", delta: 0 },
          ],
        },
        forbidden: {
          text: t("chapter1.c1s1.outcomes.forbidden"),
          rights: [
            { protection: "belonging", group: "shepherds", move: "strain" },
          ],
          trust: [
            { group: "old-timers", delta: 1 },
            { group: "shepherds", delta: -1 },
          ],
        },
        "by-turn": {
          text: t("chapter1.c1s1.outcomes.by_turn"),
          rights: [],
          trust: [
            { group: "old-timers", delta: 0 },
            { group: "shepherds", delta: 0 },
          ],
        },
        "share-equally": {
          text: t("chapter1.c1s1.outcomes.share_equally"),
          rights: [
            { protection: "property", group: "old-timers", move: "strain" },
          ],
          trust: [
            { group: "old-timers", delta: -1 },
            { group: "shepherds", delta: 1 },
          ],
        },
      },
    },

    {
      id: "c1s2",
      chapter: 1,
      title: t("chapter1.c1s2.title"),
      speakerGroup: "children",
      text: t("chapter1.c1s2.text"),
      subject: "path",
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
        rights: [
          { protection: "belonging", group: "children", move: "strain" },
        ],
        trust: [{ group: "children", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter1.c1s2.override_outcome"),
        rights: [{ protection: "equality", group: "children", move: "strain" }],
        trust: [{ group: "children", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter1.c1s2.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "children", delta: 1 },
            { group: "builders", delta: -1 },
          ],
        },
        forbidden: {
          text: t("chapter1.c1s2.outcomes.forbidden"),
          rights: [
            { protection: "belonging", group: "builders", move: "strain" },
          ],
          trust: [
            { group: "children", delta: 1 },
            { group: "builders", delta: -1 },
          ],
        },
        "by-turn": {
          text: t("chapter1.c1s2.outcomes.by_turn"),
          rights: [],
          trust: [{ group: "children", delta: 0 }],
        },
        "share-equally": {
          text: t("chapter1.c1s2.outcomes.share_equally"),
          rights: [],
          trust: [
            { group: "children", delta: 0 },
            { group: "builders", delta: 0 },
          ],
        },
      },
    },

    {
      id: "c1s3",
      chapter: 1,
      title: t("chapter1.c1s3.title"),
      speakerGroup: "old-timers",
      text: t("chapter1.c1s3.text"),
      subject: "water",
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
        rights: [
          { protection: "property", group: "old-timers", move: "strain" },
        ],
        trust: [{ group: "old-timers", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter1.c1s3.override_outcome"),
        rights: [
          { protection: "equality", group: "old-timers", move: "strain" },
          { protection: "equality", group: "children", move: "strain" },
        ],
        trust: [{ group: "old-timers", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter1.c1s3.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "children", delta: -1 },
            { group: "old-timers", delta: 1 },
          ],
        },
        forbidden: {
          text: t("chapter1.c1s3.outcomes.forbidden"),
          rights: [
            { protection: "belonging", group: "children", move: "break" },
          ],
          trust: [
            { group: "children", delta: -2 },
            { group: "old-timers", delta: 1 },
          ],
        },
        "by-turn": {
          text: t("chapter1.c1s3.outcomes.by_turn"),
          rights: [
            { protection: "belonging", group: "children", move: "strain" },
          ],
          trust: [
            { group: "children", delta: -1 },
            { group: "old-timers", delta: 1 },
          ],
        },
        "share-equally": {
          text: t("chapter1.c1s3.outcomes.share_equally"),
          rights: [
            { protection: "property", group: "old-timers", move: "strain" },
          ],
          trust: [
            { group: "children", delta: 1 },
            { group: "old-timers", delta: -1 },
          ],
        },
      },
    },

    {
      id: "c1s4",
      chapter: 1,
      title: t("chapter1.c1s4.title"),
      speakerGroup: "newcomers",
      text: t("chapter1.c1s4.text"),
      subject: "path",
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
        rights: [
          { protection: "belonging", group: "children", move: "strain" },
        ],
        trust: [
          { group: "newcomers", delta: 1 },
          { group: "children", delta: -1 },
        ],
      },
      overrideOutcome: {
        text: t("chapter1.c1s4.override_outcome"),
        rights: [{ protection: "equality", group: "children", move: "strain" }],
        trust: [
          { group: "newcomers", delta: 1 },
          { group: "children", delta: -1 },
        ],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter1.c1s4.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "newcomers", delta: 1 },
            { group: "builders", delta: 1 },
          ],
        },
        forbidden: {
          text: t("chapter1.c1s4.outcomes.forbidden"),
          rights: [
            { protection: "shelter", group: "newcomers", move: "break" },
          ],
          trust: [
            { group: "newcomers", delta: -2 },
            { group: "builders", delta: -1 },
          ],
        },
        "by-turn": {
          text: t("chapter1.c1s4.outcomes.by_turn"),
          rights: [
            { protection: "shelter", group: "newcomers", move: "strain" },
          ],
          trust: [{ group: "newcomers", delta: -1 }],
        },
        "share-equally": {
          text: t("chapter1.c1s4.outcomes.share_equally"),
          rights: [],
          trust: [
            { group: "newcomers", delta: 1 },
            { group: "children", delta: 0 },
          ],
        },
      },
    },
  ];

  return {
    title: t("chapter1.title"),
    intro: t("chapter1.intro"),
    situations,
  };
});
