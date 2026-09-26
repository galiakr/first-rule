/**
 * Chapter 5 — "מי מחליט מי מחליט" (Who Decides Who Decides).
 *
 * Design doc §9.5. Four chapters of ruling without anyone having appointed
 * the child (§4) finally get questioned: Yotam settles a dispute on his own
 * (c5s1), Dana settles a different one against him (c5s2), and since nothing
 * in the book says who decides, both are exactly equally right. The only way
 * out is a rule about who decides — and like every rule the child has
 * written, it applies to them too.
 *
 * Two situations here branch on something other than their WHAT clause, via
 * `variantOutcomes` (see outcomeFor):
 *
 *   c5s3 — on which authority form was written, with the election folded in.
 *          Winning and losing the same vote are different things to live
 *          through, so they are separate variants.
 *   c5s4 — on whether the child still decides at all.
 *
 * The chapter ends with the book closing (§10), which is a phase in page.tsx,
 * not content here.
 */

import { perLanguage, translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";
import type { Chapter, Situation } from "@/engine/types";

export const chapter5 = perLanguage((lang: Lang): Chapter => {
  const t = translator(lang);
  const situations: Situation[] = [
    {
      id: "c5s1",
      chapter: 5,
      // The shepherds are the ones who went to Yotam instead of to you, so a
      // low-trust opener here reads exactly right.
      speakerGroup: "shepherds",
      title: t("chapter5.c5s1.title"),
      text: t("chapter5.c5s1.text"),
      subject: "path",
      act: "blocked",
      justification: "was-mine-first",
      power: "equal",
      actorId: "yotam",
      victimId: "dana",
      scarce: false,
      someoneHarmed: true,
      firstOffence: true,
      invitesRule: false,
      lesson: t("chapter5.c5s1.lesson"),
      noRuleOutcome: {
        text: t("chapter5.c5s1.no_rule_outcome"),
        rights: [
          { protection: "fair-hearing", group: "shepherds", move: "strain" },
        ],
        trust: [{ group: "shepherds", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter5.c5s1.override_outcome"),
        rights: [
          { protection: "equality", group: "shepherds", move: "strain" },
        ],
        trust: [{ group: "shepherds", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter5.c5s1.outcomes.ask_first"),
          rights: [],
          trust: [
            { group: "shepherds", delta: 1 },
            { group: "builders", delta: 1 },
          ],
        },
        forbidden: {
          text: t("chapter5.c5s1.outcomes.forbidden"),
          rights: [],
          trust: [
            { group: "shepherds", delta: 1 },
            { group: "builders", delta: -1 },
          ],
        },
        "by-turn": {
          text: t("chapter5.c5s1.outcomes.by_turn"),
          rights: [],
          trust: [
            { group: "shepherds", delta: 1 },
            { group: "builders", delta: 1 },
          ],
        },
        "share-equally": {
          text: t("chapter5.c5s1.outcomes.share_equally"),
          rights: [],
          trust: [{ group: "shepherds", delta: 1 }],
        },
      },
    },
    {
      id: "c5s2",
      chapter: 5,
      speakerGroup: "old-timers",
      title: t("chapter5.c5s2.title"),
      text: t("chapter5.c5s2.text"),
      subject: "water",
      act: "blocked",
      justification: "nobody-said-no",
      power: "equal",
      actorId: "dana",
      victimId: "yotam",
      scarce: false,
      someoneHarmed: true,
      firstOffence: true,
      invitesRule: false,
      // The one situation in the game that asks for the authority rule.
      invitesAuthority: true,
      lesson: t("chapter5.c5s2.lesson"),
      // Writing the line is what this situation is for; which form it says
      // bites at c5s3, not here. Skipping falls through to noRuleOutcome —
      // the village simply goes on with two people ruling.
      variantOutcomes: {
        "authority-written": {
          text: t("chapter5.c5s2.variant.authority_written"),
          rights: [],
          trust: [
            { group: "old-timers", delta: 1 },
            { group: "shepherds", delta: 1 },
          ],
        },
      },
      noRuleOutcome: {
        text: t("chapter5.c5s2.no_rule_outcome"),
        rights: [
          { protection: "fair-hearing", group: "old-timers", move: "strain" },
          { protection: "equality", group: "children", move: "strain" },
        ],
        trust: [
          { group: "old-timers", delta: -1 },
          { group: "children", delta: -1 },
        ],
      },
      overrideOutcome: {
        text: t("chapter5.c5s2.override_outcome"),
        rights: [
          { protection: "equality", group: "old-timers", move: "strain" },
        ],
        trust: [{ group: "old-timers", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter5.c5s2.outcomes.ask_first"),
          rights: [],
          trust: [{ group: "old-timers", delta: 1 }],
        },
        forbidden: {
          text: t("chapter5.c5s2.outcomes.forbidden"),
          rights: [],
          trust: [{ group: "old-timers", delta: 1 }],
        },
        "by-turn": {
          text: t("chapter5.c5s2.outcomes.by_turn"),
          rights: [
            { protection: "fair-hearing", group: "old-timers", move: "strain" },
          ],
          trust: [{ group: "old-timers", delta: -1 }],
        },
        "share-equally": {
          text: t("chapter5.c5s2.outcomes.share_equally"),
          rights: [],
          trust: [{ group: "shepherds", delta: 1 }],
        },
      },
    },
    {
      id: "c5s3",
      chapter: 5,
      speakerGroup: "children",
      title: t("chapter5.c5s3.title"),
      text: t("chapter5.c5s3.text"),
      subject: "land",
      act: "blocked",
      justification: "needed-more",
      power: "victim-weaker",
      actorId: "barak",
      victimId: "shira",
      scarce: true,
      someoneHarmed: true,
      firstOffence: true,
      invitesRule: false,
      lesson: t("chapter5.c5s3.lesson"),
      // Whatever was written about authority is what decides this one, so
      // the variants below win over the WHAT-keyed outcomes.
      variantOutcomes: {
        you: {
          text: t("chapter5.c5s3.variant.you"),
          rights: [
            { protection: "fair-hearing", group: "children", move: "strain" },
          ],
          trust: [{ group: "builders", delta: 1 }],
        },
        "most-senior": {
          text: t("chapter5.c5s3.variant.most_senior"),
          rights: [
            { protection: "equality", group: "children", move: "strain" },
          ],
          trust: [
            { group: "old-timers", delta: 1 },
            { group: "children", delta: -1 },
          ],
        },
        "two-together": {
          text: t("chapter5.c5s3.variant.two_together"),
          rights: [
            { protection: "shelter", group: "children", move: "break" },
            { protection: "shelter", group: "builders", move: "strain" },
          ],
          trust: [
            { group: "children", delta: -1 },
            { group: "builders", delta: -1 },
          ],
        },
        "each-alone": {
          text: t("chapter5.c5s3.variant.each_alone"),
          rights: [
            { protection: "equality", group: "children", move: "break" },
            { protection: "shelter", group: "children", move: "strain" },
          ],
          trust: [{ group: "children", delta: -1 }],
        },
        "village-chooses-won": {
          text: t("chapter5.c5s3.variant.village_chooses_won"),
          rights: [],
          trust: [
            { group: "children", delta: 1 },
            { group: "builders", delta: -1 },
          ],
        },
        "village-chooses-lost": {
          text: t("chapter5.c5s3.variant.village_chooses_lost"),
          rights: [
            { protection: "equality", group: "children", move: "strain" },
          ],
          trust: [{ group: "old-timers", delta: 1 }],
        },
      },
      noRuleOutcome: {
        text: t("chapter5.c5s3.no_rule_outcome"),
        rights: [
          { protection: "shelter", group: "children", move: "break" },
          { protection: "shelter", group: "builders", move: "strain" },
        ],
        trust: [
          { group: "children", delta: -1 },
          { group: "builders", delta: -1 },
        ],
      },
      overrideOutcome: {
        text: t("chapter5.c5s3.override_outcome"),
        rights: [{ protection: "equality", group: "children", move: "strain" }],
        trust: [{ group: "children", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter5.c5s3.no_rule_outcome"),
          rights: [],
          trust: [],
        },
        forbidden: {
          text: t("chapter5.c5s3.no_rule_outcome"),
          rights: [],
          trust: [],
        },
        "by-turn": {
          text: t("chapter5.c5s3.no_rule_outcome"),
          rights: [],
          trust: [],
        },
        "share-equally": {
          text: t("chapter5.c5s3.no_rule_outcome"),
          rights: [],
          trust: [],
        },
      },
    },
    {
      id: "c5s4",
      chapter: 5,
      speakerGroup: "newcomers",
      title: t("chapter5.c5s4.title"),
      text: t("chapter5.c5s4.text"),
      subject: "things",
      act: "refused-to-share",
      justification: "nobody-said-no",
      power: "equal",
      actorId: "you",
      victimId: "michal",
      scarce: false,
      someoneHarmed: true,
      firstOffence: true,
      invitesRule: false,
      lesson: t("chapter5.c5s4.lesson"),
      // Branches only on whether the child is still the one deciding.
      variantOutcomes: {
        "you-decide": {
          text: t("chapter5.c5s4.variant.you_decide"),
          rights: [],
          trust: [{ group: "newcomers", delta: 1 }],
        },
        "other-decides": {
          text: t("chapter5.c5s4.variant.other_decides"),
          rights: [],
          trust: [
            { group: "newcomers", delta: 1 },
            { group: "old-timers", delta: 1 },
          ],
        },
      },
      noRuleOutcome: {
        text: t("chapter5.c5s4.no_rule_outcome"),
        rights: [
          { protection: "property", group: "newcomers", move: "strain" },
        ],
        trust: [{ group: "newcomers", delta: -1 }],
      },
      overrideOutcome: {
        text: t("chapter5.c5s4.override_outcome"),
        rights: [
          { protection: "equality", group: "newcomers", move: "strain" },
        ],
        trust: [{ group: "newcomers", delta: -1 }],
      },
      outcomes: {
        "ask-first": {
          text: t("chapter5.c5s4.variant.you_decide"),
          rights: [],
          trust: [{ group: "newcomers", delta: 1 }],
        },
        forbidden: {
          text: t("chapter5.c5s4.variant.you_decide"),
          rights: [],
          trust: [{ group: "newcomers", delta: 1 }],
        },
        "by-turn": {
          text: t("chapter5.c5s4.variant.you_decide"),
          rights: [],
          trust: [{ group: "newcomers", delta: 1 }],
        },
        "share-equally": {
          text: t("chapter5.c5s4.variant.you_decide"),
          rights: [],
          trust: [{ group: "newcomers", delta: 1 }],
        },
      },
    },
  ];

  return {
    title: t("chapter5.title"),
    intro: t("chapter5.intro"),
    epilogue: t("chapter5.epilogue"),
    situations,
  };
});
