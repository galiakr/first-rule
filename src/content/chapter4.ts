/**
 * פרק 4 — מי שלא היה כאן.
 *
 * The passers-through arrive (design doc §9.4). The chapter turns on one
 * field the child picked chapters ago: WHO a rule applies to. §6 requires
 * both of its outcomes to be reachable, and says neither is right —
 *
 *   residents / group      → no rule reaches נעם. The gap is felt (c4s1).
 *   anyone-present / …     → he's punished under a rule he had no part in
 *                            writing, and a character says so out loud.
 *
 * Both fall straight out of `whoCovers` + `ruleApplies`, so this chapter
 * adds no matching logic — only content. See docs/chapter-4-plan.md.
 *
 * Two rules the content holds to, both pinned by tests:
 *
 * 1. `ovrim` never speaks. §4: "אין להם קול בכלל" — no situation here sets
 *    speakerGroup "ovrim", so what נעם did, or what was done to him, is
 *    always reported by someone else. His trust still moves; it's just never
 *    his voice that opens a scene.
 * 2. `ruleApplies` checks the *actor's* coverage, not the victim's, so a
 *    residents-only rule binds ברק and thereby protects נעם without ever
 *    having asked him anything. c4s2 exists to make that asymmetry visible.
 */

import { perLanguage, translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";
import type { Chapter, Situation } from "@/engine/types";

export const chapter4 = perLanguage((lang: Lang): Chapter => {
  const t = translator(lang);
  const situations: Situation[] = [
    {
      id: "c4s1",
      chapter: 4,
      // יותם reports it: נעם is already gone, and would not have spoken anyway.
      speakerGroup: "vatikim",
      title: t("chapter4.c4s1.title"),
      text: t("chapter4.c4s1.text"),
      subject: "mayim",
      act: "took-without-asking",
      justification: "needed-more",
      // נעם owns nothing here and has no standing; יותם dug the well.
      power: "victim-stronger",
      actorId: "noam",
      victimId: "yotam",
      scarce: false,
      someoneHarmed: true,
      firstOffence: true,
      invitesRule: false,
      lesson: t("chapter4.c4s1.lesson"),
      // The gap (§6, first half): nothing in the book reaches him.
      noRuleOutcome: {
        text: t("chapter4.c4s1.no_rule_outcome"),
        rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
        trust: [{ group: "vatikim", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter4.c4s1.override_outcome"),
        rights: [{ protection: "shivyon", group: "vatikim", move: "strain" }],
        trust: [{ group: "vatikim", delta: -1 }],
      },
      // The other half: he is covered, and pays under a rule he had no part
      // in. This is where the rights board first names העוברים (§8).
      outcomes: {
        "ask-first": {
          text: t("chapter4.c4s1.outcomes.ask_first"),
          rights: [
            { protection: "kinyan", group: "ovrim", move: "strain" },
            { protection: "shivyon", group: "ovrim", move: "strain" },
          ],
          trust: [
            { group: "vatikim", delta: 1 },
            { group: "ovrim", delta: -1 },
          ],
        },
        forbidden: {
          text: t("chapter4.c4s1.outcomes.forbidden"),
          rights: [
            { protection: "kinyan", group: "ovrim", move: "break" },
            { protection: "shivyon", group: "ovrim", move: "strain" },
          ],
          trust: [
            { group: "vatikim", delta: 1 },
            { group: "ovrim", delta: -1 },
          ],
        },
        "by-turn": {
          text: t("chapter4.c4s1.outcomes.by_turn"),
          rights: [{ protection: "shivyon", group: "ovrim", move: "strain" }],
          trust: [{ group: "ovrim", delta: -1 }],
        },
        // The one reach that happens to favour him — still a rule he had no
        // part in writing, which is the whole point of the chapter.
        "share-equally": {
          text: t("chapter4.c4s1.outcomes.share_equally"),
          rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
          trust: [
            { group: "vatikim", delta: -1 },
            { group: "ovrim", delta: 1 },
          ],
        },
      },
    },
    {
      id: "c4s2",
      chapter: 4,
      // מיכל reports it — she arrived recently enough to notice.
      speakerGroup: "hadashim",
      title: t("chapter4.c4s2.title"),
      text: t("chapter4.c4s2.text"),
      subject: "chefetz",
      act: "took-without-asking",
      justification: "nobody-said-no",
      power: "victim-weaker",
      actorId: "barak",
      victimId: "noam",
      scarce: false,
      someoneHarmed: true,
      // ברק already took מיכל's hammer back in c2s1.
      firstOffence: false,
      invitesRule: false,
      lesson: t("chapter4.c4s2.lesson"),
      noRuleOutcome: {
        text: t("chapter4.c4s2.no_rule_outcome"),
        rights: [
          { protection: "kinyan", group: "ovrim", move: "break" },
          { protection: "machse", group: "ovrim", move: "strain" },
        ],
        trust: [{ group: "ovrim", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter4.c4s2.override_outcome"),
        rights: [{ protection: "shivyon", group: "hadashim", move: "strain" }],
        trust: [
          { group: "hadashim", delta: -1 },
          { group: "ovrim", delta: -1 },
        ],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter4.c4s2.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "hadashim", delta: 1 },
            { group: "ovrim", delta: 1 },
          ],
        },
        forbidden: {
          text: t("chapter4.c4s2.outcomes.forbidden"),
          rights: [],
          trust: [
            { group: "hadashim", delta: 1 },
            { group: "ovrim", delta: 1 },
          ],
        },
        "by-turn": {
          text: t("chapter4.c4s2.outcomes.by_turn"),
          rights: [{ protection: "kinyan", group: "ovrim", move: "strain" }],
          trust: [{ group: "ovrim", delta: -1 }],
        },
        "share-equally": {
          text: t("chapter4.c4s2.outcomes.share_equally"),
          rights: [{ protection: "kinyan", group: "ovrim", move: "strain" }],
          trust: [{ group: "banaim", delta: 1 }],
        },
      },
    },
    {
      id: "c4s3",
      chapter: 4,
      speakerGroup: "roim",
      title: t("chapter4.c4s3.title"),
      text: t("chapter4.c4s3.text"),
      subject: "shetach",
      act: "blocked",
      justification: "needed-more",
      power: "victim-weaker",
      actorId: "dana",
      victimId: "noam",
      scarce: true,
      someoneHarmed: true,
      firstOffence: true,
      // The one rule this chapter invites, written with נעם's stake named
      // out loud in the scene so the WHO choice is conscious (§2).
      invitesRule: true,
      lesson: t("chapter4.c4s3.lesson"),
      noRuleOutcome: {
        text: t("chapter4.c4s3.no_rule_outcome"),
        rights: [{ protection: "machse", group: "ovrim", move: "strain" }],
        trust: [{ group: "ovrim", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter4.c4s3.override_outcome"),
        rights: [{ protection: "shivyon", group: "ovrim", move: "strain" }],
        trust: [{ group: "ovrim", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter4.c4s3.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "ovrim", delta: 1 },
            { group: "roim", delta: -1 },
          ],
        },
        forbidden: {
          text: t("chapter4.c4s3.outcomes.forbidden"),
          rights: [{ protection: "kinyan", group: "roim", move: "strain" }],
          trust: [
            { group: "roim", delta: -1 },
            { group: "ovrim", delta: 1 },
          ],
        },
        "by-turn": {
          text: t("chapter4.c4s3.outcomes.by_turn"),
          rights: [],
          trust: [{ group: "roim", delta: 1 }],
        },
        "share-equally": {
          text: t("chapter4.c4s3.outcomes.share_equally"),
          rights: [],
          trust: [
            { group: "roim", delta: -1 },
            { group: "ovrim", delta: 1 },
          ],
        },
      },
    },
    {
      id: "c4s4",
      chapter: 4,
      speakerGroup: "hadashim",
      title: t("chapter4.c4s4.title"),
      text: t("chapter4.c4s4.text"),
      subject: "shetach",
      act: "blocked",
      justification: "nobody-said-no",
      power: "equal",
      actorId: "noam",
      victimId: "michal",
      scarce: true,
      someoneHarmed: true,
      // He took water in c4s1.
      firstOffence: false,
      invitesRule: false,
      lesson: t("chapter4.c4s4.lesson"),
      // Fires when the c4s3 rule was scoped residents / group / everyone-
      // except-ovrim: the book is silent about him, and residents ask why.
      noRuleOutcome: {
        text: t("chapter4.c4s4.no_rule_outcome"),
        rights: [{ protection: "machse", group: "hadashim", move: "strain" }],
        trust: [{ group: "hadashim", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter4.c4s4.override_outcome"),
        rights: [{ protection: "shivyon", group: "hadashim", move: "strain" }],
        trust: [{ group: "hadashim", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter4.c4s4.outcomes.ask_first"),
          rights: [{ protection: "shivyon", group: "ovrim", move: "strain" }],
          trust: [
            { group: "hadashim", delta: 1 },
            { group: "ovrim", delta: -1 },
          ],
        },
        forbidden: {
          text: t("chapter4.c4s4.outcomes.forbidden"),
          rights: [
            { protection: "machse", group: "ovrim", move: "break" },
            { protection: "shivyon", group: "ovrim", move: "strain" },
          ],
          trust: [
            { group: "hadashim", delta: 1 },
            { group: "ovrim", delta: -1 },
          ],
        },
        "by-turn": {
          text: t("chapter4.c4s4.outcomes.by_turn"),
          rights: [{ protection: "shivyon", group: "ovrim", move: "strain" }],
          trust: [{ group: "ovrim", delta: -1 }],
        },
        "share-equally": {
          text: t("chapter4.c4s4.outcomes.share_equally"),
          rights: [],
          trust: [
            { group: "hadashim", delta: 1 },
            { group: "ovrim", delta: 1 },
          ],
        },
      },
    },
  ];

  return {
    title: t("chapter4.title"),
    intro: t("chapter4.intro"),
    // Both halves of §6's concept, said together and only now.
    epilogue: t("chapter4.epilogue"),
    situations,
  };
});
