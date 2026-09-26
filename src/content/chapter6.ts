/**
 * פרק 6 — הספר גמור, מי שומר עליו.
 *
 * Design doc §9.6. The book is closed, so nothing here invites a rule; what's
 * left is what gets done with it, which turns out to be three jobs rather
 * than one. The chapter opens by replaying three of the child's own moments
 * (built from the log by `keyMoments`, not authored here), names each, and
 * then has the village staff them.
 *
 * Every situation branches on that staffing rather than on its WHAT clause,
 * through `variantOutcomes` and `separationVariants`:
 *
 *   c6s1 — you-judge / other-judges
 *   c6s2 — you-enforce / other-enforces
 *   c6s3 — kept-together / split. The pinch: the child judges their own case
 *          under a rule they wrote, and מיכל names it without accusing.
 *   c6s4 — kept-together / split, plus a `revoked` variant reachable only by
 *          choosing to tear the arrangement up (§9.6: "loses everything he
 *          built"). The cost of that is computed in revokeSeparation, since
 *          it depends on who had been appointed.
 *
 * `outcomes` still carries all four WHAT clauses — a rule may well fire on
 * these scenes — but the variants win, because what the scene is about is
 * who is holding which job.
 */

import { perLanguage, translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";
import type { Chapter, Outcome, Situation } from "@/engine/types";

export const chapter6 = perLanguage((lang: Lang): Chapter => {
  const t = translator(lang);

  /** These scenes turn on the staffing, so every WHAT clause lands the same. */
  const sameForEveryClause = (outcome: Outcome) => ({
    "ask-first": outcome,
    forbidden: outcome,
    "by-turn": outcome,
    "share-equally": outcome,
  });

  const situations: Situation[] = [
    {
      id: "c6s1",
      chapter: 6,
      speakerGroup: "roim",
      title: t("chapter6.c6s1.title"),
      text: t("chapter6.c6s1.text"),
      subject: "shetach",
      act: "blocked",
      justification: "nobody-said-no",
      power: "equal",
      actorId: "dana",
      victimId: "michal",
      scarce: true,
      someoneHarmed: false,
      firstOffence: true,
      invitesRule: false,
      lesson: t("chapter6.c6s1.lesson"),
      variantOutcomes: {
        "you-judge": {
          text: t("chapter6.c6s1.variant.you_judge"),
          rights: [],
          trust: [{ group: "roim", delta: 1 }],
        },
        "other-judges": {
          text: t("chapter6.c6s1.variant.other_judges"),
          rights: [],
          trust: [
            { group: "roim", delta: 1 },
            { group: "hadashim", delta: 1 },
          ],
        },
      },
      noRuleOutcome: {
        text: t("chapter6.c6s1.variant.you_judge"),
        rights: [],
        trust: [],
      },
      overrideOutcome: {
        text: t("chapter6.c6s1.variant.you_judge"),
        rights: [],
        trust: [],
      },
      outcomes: sameForEveryClause({
        text: t("chapter6.c6s1.variant.you_judge"),
        rights: [],
        trust: [],
      }),
    },
    {
      id: "c6s2",
      chapter: 6,
      speakerGroup: "yeladim",
      title: t("chapter6.c6s2.title"),
      text: t("chapter6.c6s2.text"),
      subject: "mayim",
      act: "took-without-asking",
      justification: "needed-more",
      power: "victim-weaker",
      actorId: "shira",
      victimId: "yotam",
      scarce: false,
      someoneHarmed: true,
      firstOffence: false,
      invitesRule: false,
      lesson: t("chapter6.c6s2.lesson"),
      variantOutcomes: {
        "you-enforce": {
          text: t("chapter6.c6s2.variant.you_enforce"),
          rights: [],
          trust: [
            { group: "yeladim", delta: -1 },
            { group: "vatikim", delta: 1 },
          ],
        },
        "other-enforces": {
          text: t("chapter6.c6s2.variant.other_enforces"),
          rights: [{ protection: "halich", group: "yeladim", move: "strain" }],
          trust: [{ group: "yeladim", delta: -1 }],
        },
      },
      noRuleOutcome: {
        text: t("chapter6.c6s2.variant.you_enforce"),
        rights: [],
        trust: [],
      },
      overrideOutcome: {
        text: t("chapter6.c6s2.variant.you_enforce"),
        rights: [],
        trust: [],
      },
      outcomes: sameForEveryClause({
        text: t("chapter6.c6s2.variant.you_enforce"),
        rights: [],
        trust: [],
      }),
    },
    {
      id: "c6s3",
      chapter: 6,
      speakerGroup: "banaim",
      title: t("chapter6.c6s3.title"),
      text: t("chapter6.c6s3.text"),
      subject: "chefetz",
      act: "took-without-asking",
      justification: "was-mine-first",
      power: "equal",
      actorId: "you",
      victimId: "barak",
      scarce: false,
      someoneHarmed: true,
      firstOffence: true,
      invitesRule: false,
      lesson: t("chapter6.c6s3.lesson"),
      // The pinch. Keeping both writing and judging means ruling on your own
      // case under your own rule, and מיכל names it — without accusing,
      // because §2 forbids the game telling the child they were wrong.
      variantOutcomes: {
        "kept-together": {
          text: t("chapter6.c6s3.variant.kept_together"),
          rights: [
            { protection: "halich", group: "banaim", move: "strain" },
            { protection: "shivyon", group: "banaim", move: "strain" },
          ],
          trust: [{ group: "banaim", delta: -1 }],
        },
        split: {
          text: t("chapter6.c6s3.variant.split"),
          rights: [],
          trust: [
            { group: "banaim", delta: 1 },
            { group: "hadashim", delta: 1 },
          ],
        },
      },
      noRuleOutcome: {
        text: t("chapter6.c6s3.variant.kept_together"),
        rights: [],
        trust: [],
      },
      overrideOutcome: {
        text: t("chapter6.c6s3.variant.kept_together"),
        rights: [],
        trust: [],
      },
      outcomes: sameForEveryClause({
        text: t("chapter6.c6s3.variant.kept_together"),
        rights: [],
        trust: [],
      }),
    },
    {
      id: "c6s4",
      chapter: 6,
      speakerGroup: "hadashim",
      title: t("chapter6.c6s4.title"),
      text: t("chapter6.c6s4.text"),
      subject: "chefetz",
      act: "refused-to-share",
      justification: "was-mine-first",
      power: "equal",
      actorId: "barak",
      victimId: "you",
      scarce: false,
      someoneHarmed: true,
      firstOffence: true,
      invitesRule: false,
      // Offered only when somebody else judges — see page.tsx. Keeping the
      // job yourself leaves nothing to revoke.
      offersRevoke: true,
      lesson: t("chapter6.c6s4.lesson"),
      variantOutcomes: {
        // Reachable only by choosing to tear it up. The trust and rights
        // cost is computed in revokeSeparation, not here — it depends on
        // who had been appointed, which static content can't know.
        revoked: {
          text: t("chapter6.c6s4.variant.revoked"),
          rights: [],
          trust: [],
        },
        split: {
          text: t("chapter6.c6s4.variant.split"),
          rights: [],
          trust: [
            { group: "hadashim", delta: 1 },
            { group: "banaim", delta: 1 },
            { group: "vatikim", delta: 1 },
          ],
        },
        "kept-together": {
          text: t("chapter6.c6s4.variant.kept_together"),
          rights: [],
          trust: [{ group: "hadashim", delta: 1 }],
        },
      },
      noRuleOutcome: {
        text: t("chapter6.c6s4.variant.kept_together"),
        rights: [],
        trust: [],
      },
      overrideOutcome: {
        text: t("chapter6.c6s4.variant.kept_together"),
        rights: [],
        trust: [],
      },
      outcomes: sameForEveryClause({
        text: t("chapter6.c6s4.variant.kept_together"),
        rights: [],
        trust: [],
      }),
    },
  ];

  return {
    title: t("chapter6.title"),
    intro: t("chapter6.intro"),
    epilogue: t("chapter6.epilogue"),
    situations,
  };
});
