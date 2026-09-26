/**
 * פרק 7 — לשנות את מה שכבר כתוב. The ending.
 *
 * Design doc §9.7. A rule in the book has started to hurt, and this time the
 * child is the one who wants it gone. They cannot delete it: the book closed
 * in chapter 5, and the only way through is the amendment rule they wrote at
 * the end of that chapter, behind a veil, before they knew who would need it.
 *
 * c7s1 is deliberately a `davar` situation. That subject was introduced at
 * c2s2 and never pinched again — a standing §7 violation, since the design's
 * central content law is that every rule the child can write has at least one
 * future situation where applying it costs somebody. This is that situation,
 * and it is the last chance to be one.
 *
 * The bite is chosen so the child wants the rule *changed* rather than merely
 * resenting it: the rule was written to protect someone's confidence, and
 * here keeping it means nobody can help שירה. A rule doing exactly what it
 * says, and costing exactly what it costs.
 *
 * c7s2 branches on the amendment rule (`amendmentVariants`), c7s3 on living
 * with whatever that came to, and c7s4 is quiet on purpose: the village
 * settles something out of the book without anyone turning to the child.
 */

import { perLanguage, translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";
import type { Chapter, Outcome, Situation } from "@/engine/types";

export const chapter7 = perLanguage((lang: Lang): Chapter => {
  const t = translator(lang);

  const sameForEveryClause = (outcome: Outcome) => ({
    "ask-first": outcome,
    forbidden: outcome,
    "by-turn": outcome,
    "share-equally": outcome,
  });

  const situations: Situation[] = [
    {
      id: "c7s1",
      chapter: 7,
      speakerGroup: "yeladim",
      title: t("chapter7.c7s1.title"),
      text: t("chapter7.c7s1.text"),
      // The one subject the game never pinched until now (§7).
      subject: "davar",
      act: "told-what-was-private",
      justification: "meant-to-return",
      power: "victim-weaker",
      actorId: "you",
      victimId: "shira",
      scarce: false,
      someoneHarmed: true,
      firstOffence: true,
      invitesRule: false,
      lesson: t("chapter7.c7s1.lesson"),
      noRuleOutcome: {
        text: t("chapter7.c7s1.no_rule_outcome"),
        rights: [{ protection: "bitui", group: "yeladim", move: "strain" }],
        trust: [{ group: "yeladim", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter7.c7s1.override_outcome"),
        rights: [{ protection: "shivyon", group: "yeladim", move: "strain" }],
        trust: [{ group: "yeladim", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter7.c7s1.outcomes.ask_first"),
          rights: [{ protection: "machse", group: "yeladim", move: "strain" }],
          trust: [{ group: "yeladim", delta: -1 }],
        },
        // Written to protect somebody, and here it does the opposite.
        forbidden: {
          text: t("chapter7.c7s1.outcomes.forbidden"),
          rights: [
            { protection: "machse", group: "yeladim", move: "break" },
            { protection: "shayachut", group: "yeladim", move: "strain" },
          ],
          trust: [{ group: "yeladim", delta: -1 }],
        },
        "by-turn": {
          text: t("chapter7.c7s1.outcomes.by_turn"),
          rights: [{ protection: "machse", group: "yeladim", move: "strain" }],
          trust: [],
        },
        "share-equally": {
          text: t("chapter7.c7s1.outcomes.share_equally"),
          rights: [{ protection: "bitui", group: "yeladim", move: "break" }],
          trust: [{ group: "yeladim", delta: -1 }],
        },
      },
    },
    {
      id: "c7s2",
      chapter: 7,
      speakerGroup: "vatikim",
      title: t("chapter7.c7s2.title"),
      text: t("chapter7.c7s2.text"),
      subject: "davar",
      act: "told-what-was-private",
      justification: "nobody-said-no",
      power: "equal",
      actorId: "you",
      victimId: "shira",
      scarce: false,
      someoneHarmed: false,
      firstOffence: true,
      invitesRule: false,
      invitesAmendment: true,
      // The rule protects what שירה told in confidence, so it is the children
      // whose agreement the child needs — the same group c7s1 just cost.
      amendmentStakeholder: "yeladim",
      lesson: t("chapter7.c7s2.lesson"),
      // Branches on what the amendment rule turned out to mean, which the
      // child decided two chapters ago without knowing.
      variantOutcomes: {
        "not-attempted": {
          text: t("chapter7.c7s2.variant.left_alone"),
          rights: [],
          trust: [],
        },
        "applied-author": {
          text: t("chapter7.c7s2.variant.applied_author"),
          rights: [{ protection: "halich", group: "vatikim", move: "strain" }],
          trust: [{ group: "yeladim", delta: 1 }],
        },
        "applied-agreed": {
          text: t("chapter7.c7s2.variant.applied_agreed"),
          rights: [],
          trust: [
            { group: "yeladim", delta: 1 },
            { group: "vatikim", delta: 1 },
          ],
        },
        "refused-no-agreement": {
          text: t("chapter7.c7s2.variant.refused_no_agreement"),
          rights: [],
          trust: [],
        },
        delayed: {
          text: t("chapter7.c7s2.variant.delayed"),
          rights: [],
          trust: [{ group: "hadashim", delta: 1 }],
        },
        "refused-unchangeable": {
          text: t("chapter7.c7s2.variant.refused_unchangeable"),
          rights: [],
          trust: [],
        },
      },
      noRuleOutcome: {
        text: t("chapter7.c7s2.variant.left_alone"),
        rights: [],
        trust: [],
      },
      overrideOutcome: {
        text: t("chapter7.c7s2.variant.left_alone"),
        rights: [],
        trust: [],
      },
      outcomes: sameForEveryClause({
        text: t("chapter7.c7s2.variant.left_alone"),
        rights: [],
        trust: [],
      }),
    },
    {
      id: "c7s3",
      chapter: 7,
      speakerGroup: "hadashim",
      title: t("chapter7.c7s3.title"),
      text: t("chapter7.c7s3.text"),
      subject: "davar",
      act: "told-what-was-private",
      justification: "everyone-does-it",
      power: "equal",
      actorId: "you",
      victimId: "michal",
      scarce: false,
      someoneHarmed: true,
      firstOffence: false,
      invitesRule: false,
      lesson: t("chapter7.c7s3.lesson"),
      variantOutcomes: {
        "not-attempted": {
          text: t("chapter7.c7s3.variant.not_attempted"),
          rights: [],
          trust: [],
        },
        "applied-author": {
          text: t("chapter7.c7s3.variant.applied_author"),
          rights: [{ protection: "shivyon", group: "vatikim", move: "strain" }],
          trust: [],
        },
        "applied-agreed": {
          text: t("chapter7.c7s3.variant.applied_agreed"),
          rights: [],
          trust: [{ group: "hadashim", delta: 1 }],
        },
        "refused-no-agreement": {
          text: t("chapter7.c7s3.variant.refused_no_agreement"),
          rights: [{ protection: "machse", group: "yeladim", move: "strain" }],
          trust: [],
        },
        // The wait is what this form costs, and somebody stands inside it.
        delayed: {
          text: t("chapter7.c7s3.variant.delayed"),
          rights: [{ protection: "machse", group: "hadashim", move: "break" }],
          trust: [{ group: "hadashim", delta: -1 }],
        },
        "refused-unchangeable": {
          text: t("chapter7.c7s3.variant.refused_unchangeable"),
          rights: [{ protection: "machse", group: "yeladim", move: "strain" }],
          trust: [],
        },
      },
      noRuleOutcome: {
        text: t("chapter7.c7s3.variant.not_attempted"),
        rights: [],
        trust: [],
      },
      overrideOutcome: {
        text: t("chapter7.c7s3.variant.not_attempted"),
        rights: [],
        trust: [],
      },
      outcomes: sameForEveryClause({
        text: t("chapter7.c7s3.variant.not_attempted"),
        rights: [],
        trust: [],
      }),
    },
    {
      id: "c7s4",
      chapter: 7,
      speakerGroup: "banaim",
      title: t("chapter7.c7s4.title"),
      text: t("chapter7.c7s4.text"),
      // The one place in the game that uses `broke`. It fits the quietest
      // scene there is: a snapped handle, settled out of the book by two
      // people who don't need anyone to rule on it.
      subject: "chefetz",
      act: "broke",
      justification: "nobody-said-no",
      power: "equal",
      actorId: "barak",
      victimId: "michal",
      scarce: false,
      someoneHarmed: false,
      firstOffence: true,
      invitesRule: false,
      lesson: t("chapter7.c7s4.lesson"),
      // The last situation of the game reads the same whatever the book says,
      // because the point is not what it says — it's that they looked.
      noRuleOutcome: {
        text: t("chapter7.c7s4.outcome"),
        rights: [],
        trust: [],
      },
      overrideOutcome: {
        text: t("chapter7.c7s4.outcome"),
        rights: [],
        trust: [],
      },
      outcomes: sameForEveryClause({
        text: t("chapter7.c7s4.outcome"),
        rights: [],
        trust: [{ group: "banaim", delta: 1 }],
      }),
    },
  ];

  return {
    title: t("chapter7.title"),
    intro: t("chapter7.intro"),
    epilogue: t("chapter7.epilogue"),
    situations,
  };
});
