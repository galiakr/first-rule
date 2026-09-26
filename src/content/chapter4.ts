/**
 * Chapter 4 — "מי שלא היה כאן" (Who Wasn't Here).
 *
 * The passers-through arrive (design doc §9.4). The chapter turns on one
 * field the child picked chapters ago: WHO a rule applies to. §6 requires
 * both of its outcomes to be reachable, and says neither is right —
 *
 *   residents / group      → no rule reaches Noam. The gap is felt (c4s1).
 *   anyone-present / …     → he's punished under a rule he had no part in
 *                            writing, and a character says so out loud.
 *
 * Both fall straight out of `whoCovers` + `ruleApplies`, so this chapter
 * adds no matching logic — only content. See docs/chapter-4-plan.md.
 *
 * Two rules the content holds to, both pinned by tests:
 *
 * 1. `passers-through` never speaks. §4: "אין להם קול בכלל" (they have no voice at all) — no situation here sets
 *    speakerGroup "passers-through", so what Noam did, or what was done to him, is
 *    always reported by someone else. His trust still moves; it's just never
 *    his voice that opens a scene.
 * 2. `ruleApplies` checks the *actor's* coverage, not the victim's, so a
 *    residents-only rule binds Barak and thereby protects Noam without ever
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
      // Yotam reports it: Noam is already gone, and would not have spoken anyway.
      speakerGroup: "old-timers",
      title: t("chapter4.c4s1.title"),
      text: t("chapter4.c4s1.text"),
      subject: "water",
      act: "took-without-asking",
      justification: "needed-more",
      // Noam owns nothing here and has no standing; Yotam dug the well.
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
        rights: [
          { protection: "property", group: "old-timers", move: "strain" },
        ],
        trust: [{ group: "old-timers", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter4.c4s1.override_outcome"),
        rights: [
          { protection: "equality", group: "old-timers", move: "strain" },
        ],
        trust: [{ group: "old-timers", delta: -1 }],
      },
      // The other half: he is covered, and pays under a rule he had no part
      // in. This is where the rights board first names the passers-through (§8).
      outcomes: {
        "ask-first": {
          text: t("chapter4.c4s1.outcomes.ask_first"),
          rights: [
            {
              protection: "property",
              group: "passers-through",
              move: "strain",
            },
            {
              protection: "equality",
              group: "passers-through",
              move: "strain",
            },
          ],
          trust: [
            { group: "old-timers", delta: 1 },
            { group: "passers-through", delta: -1 },
          ],
        },
        forbidden: {
          text: t("chapter4.c4s1.outcomes.forbidden"),
          rights: [
            { protection: "property", group: "passers-through", move: "break" },
            {
              protection: "equality",
              group: "passers-through",
              move: "strain",
            },
          ],
          trust: [
            { group: "old-timers", delta: 1 },
            { group: "passers-through", delta: -1 },
          ],
        },
        "by-turn": {
          text: t("chapter4.c4s1.outcomes.by_turn"),
          rights: [
            {
              protection: "equality",
              group: "passers-through",
              move: "strain",
            },
          ],
          trust: [{ group: "passers-through", delta: -1 }],
        },
        // The one reach that happens to favour him — still a rule he had no
        // part in writing, which is the whole point of the chapter.
        "share-equally": {
          text: t("chapter4.c4s1.outcomes.share_equally"),
          rights: [
            { protection: "property", group: "old-timers", move: "strain" },
          ],
          trust: [
            { group: "old-timers", delta: -1 },
            { group: "passers-through", delta: 1 },
          ],
        },
      },
    },
    {
      id: "c4s2",
      chapter: 4,
      // Michal reports it — she arrived recently enough to notice.
      speakerGroup: "newcomers",
      title: t("chapter4.c4s2.title"),
      text: t("chapter4.c4s2.text"),
      subject: "things",
      act: "took-without-asking",
      justification: "nobody-said-no",
      power: "victim-weaker",
      actorId: "barak",
      victimId: "noam",
      scarce: false,
      someoneHarmed: true,
      // Barak already took Michal's hammer back in c2s1.
      firstOffence: false,
      invitesRule: false,
      lesson: t("chapter4.c4s2.lesson"),
      noRuleOutcome: {
        text: t("chapter4.c4s2.no_rule_outcome"),
        rights: [
          { protection: "property", group: "passers-through", move: "break" },
          { protection: "shelter", group: "passers-through", move: "strain" },
        ],
        trust: [{ group: "passers-through", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter4.c4s2.override_outcome"),
        rights: [
          { protection: "equality", group: "newcomers", move: "strain" },
        ],
        trust: [
          { group: "newcomers", delta: -1 },
          { group: "passers-through", delta: -1 },
        ],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter4.c4s2.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "newcomers", delta: 1 },
            { group: "passers-through", delta: 1 },
          ],
        },
        forbidden: {
          text: t("chapter4.c4s2.outcomes.forbidden"),
          rights: [],
          trust: [
            { group: "newcomers", delta: 1 },
            { group: "passers-through", delta: 1 },
          ],
        },
        "by-turn": {
          text: t("chapter4.c4s2.outcomes.by_turn"),
          rights: [
            {
              protection: "property",
              group: "passers-through",
              move: "strain",
            },
          ],
          trust: [{ group: "passers-through", delta: -1 }],
        },
        "share-equally": {
          text: t("chapter4.c4s2.outcomes.share_equally"),
          rights: [
            {
              protection: "property",
              group: "passers-through",
              move: "strain",
            },
          ],
          trust: [{ group: "builders", delta: 1 }],
        },
      },
    },
    {
      id: "c4s3",
      chapter: 4,
      speakerGroup: "shepherds",
      title: t("chapter4.c4s3.title"),
      text: t("chapter4.c4s3.text"),
      subject: "land",
      act: "blocked",
      justification: "needed-more",
      power: "victim-weaker",
      actorId: "dana",
      victimId: "noam",
      scarce: true,
      someoneHarmed: true,
      firstOffence: true,
      // The one rule this chapter invites, written with Noam's stake named
      // out loud in the scene so the WHO choice is conscious (§2).
      invitesRule: true,
      lesson: t("chapter4.c4s3.lesson"),
      noRuleOutcome: {
        text: t("chapter4.c4s3.no_rule_outcome"),
        rights: [
          { protection: "shelter", group: "passers-through", move: "strain" },
        ],
        trust: [{ group: "passers-through", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter4.c4s3.override_outcome"),
        rights: [
          { protection: "equality", group: "passers-through", move: "strain" },
        ],
        trust: [{ group: "passers-through", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter4.c4s3.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "passers-through", delta: 1 },
            { group: "shepherds", delta: -1 },
          ],
        },
        forbidden: {
          text: t("chapter4.c4s3.outcomes.forbidden"),
          rights: [
            { protection: "property", group: "shepherds", move: "strain" },
          ],
          trust: [
            { group: "shepherds", delta: -1 },
            { group: "passers-through", delta: 1 },
          ],
        },
        "by-turn": {
          text: t("chapter4.c4s3.outcomes.by_turn"),
          rights: [],
          trust: [{ group: "shepherds", delta: 1 }],
        },
        "share-equally": {
          text: t("chapter4.c4s3.outcomes.share_equally"),
          rights: [],
          trust: [
            { group: "shepherds", delta: -1 },
            { group: "passers-through", delta: 1 },
          ],
        },
      },
    },
    {
      id: "c4s4",
      chapter: 4,
      speakerGroup: "newcomers",
      title: t("chapter4.c4s4.title"),
      text: t("chapter4.c4s4.text"),
      subject: "land",
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
      // except-passers-through: the book is silent about him, and residents ask why.
      noRuleOutcome: {
        text: t("chapter4.c4s4.no_rule_outcome"),
        rights: [{ protection: "shelter", group: "newcomers", move: "strain" }],
        trust: [{ group: "newcomers", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter4.c4s4.override_outcome"),
        rights: [
          { protection: "equality", group: "newcomers", move: "strain" },
        ],
        trust: [{ group: "newcomers", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter4.c4s4.outcomes.ask_first"),
          rights: [
            {
              protection: "equality",
              group: "passers-through",
              move: "strain",
            },
          ],
          trust: [
            { group: "newcomers", delta: 1 },
            { group: "passers-through", delta: -1 },
          ],
        },
        forbidden: {
          text: t("chapter4.c4s4.outcomes.forbidden"),
          rights: [
            { protection: "shelter", group: "passers-through", move: "break" },
            {
              protection: "equality",
              group: "passers-through",
              move: "strain",
            },
          ],
          trust: [
            { group: "newcomers", delta: 1 },
            { group: "passers-through", delta: -1 },
          ],
        },
        "by-turn": {
          text: t("chapter4.c4s4.outcomes.by_turn"),
          rights: [
            {
              protection: "equality",
              group: "passers-through",
              move: "strain",
            },
          ],
          trust: [{ group: "passers-through", delta: -1 }],
        },
        "share-equally": {
          text: t("chapter4.c4s4.outcomes.share_equally"),
          rights: [],
          trust: [
            { group: "newcomers", delta: 1 },
            { group: "passers-through", delta: 1 },
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
