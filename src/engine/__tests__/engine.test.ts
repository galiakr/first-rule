import { describe, expect, it } from "vitest";

import { chapter1 } from "@/content/chapter1";
import { chapter2 } from "@/content/chapter2";
import { chapter3 } from "@/content/chapter3";
import { chapter4 } from "@/content/chapter4";
import { chapter5 } from "@/content/chapter5";
import { chapterNotes } from "@/content/notes";
import { situationsById } from "@/content/situations";
import { actors, actorsWithChild, childActor } from "@/content/village";
import {
  authorityVariant,
  canOverride,
  closeBook,
  deciderFor,
  eligibleGroups,
  runElection,
  setAuthority,
  variantKeys,
} from "../authority";
import { fieldCollision, textualConflict, whatClausesClash } from "../conflict";
import {
  activatePrecedent,
  addRule,
  advanceChapter,
  initialState,
  outcomeFor,
  promptFor,
  replaceRule,
  resolve,
  saysOverrideNote,
} from "../game";
import {
  applicableRules,
  ruleApplies,
  ruleSentence,
  whenHolds,
  whoCovers,
} from "../match";
import {
  consequenceOptions,
  whatOptions,
  whenOptions,
  whoOptions,
} from "../options";
import { TRAIT_KEYS, traitDifferences, traitsMatch } from "../precedent";
import {
  applyRights,
  emptyRightsBoard,
  GROUPS,
  harmed,
  rightsKey,
  trustLevel,
} from "../rights";
import type { GameState, Precedent, Rule, Situation } from "../types";

// The engine is language-agnostic; these tests pin behaviour, so they run
// against Hebrew (the default) unless a case is specifically about language.
const LANG = "he" as const;
const CHAPTER_1 = chapter1(LANG).situations;
const CHAPTER_2 = chapter2(LANG).situations;
const CHAPTER_3 = chapter3(LANG).situations;
const CHAPTER_4 = chapter4(LANG).situations;
const CHAPTER_5 = chapter5(LANG).situations;
const CHAPTER_NOTES = chapterNotes(LANG);
const SITUATIONS_BY_ID = situationsById(LANG);
const ACTORS = actors(LANG);
const CHILD_ACTOR = childActor(LANG);

const s1 = CHAPTER_1[0];
const s3 = CHAPTER_1[2];
const c1s2 = CHAPTER_1[1];
const c2s1 = CHAPTER_2[0];
const c2s3 = CHAPTER_2[2];
const c2s4 = CHAPTER_2[3];
const c3s1 = CHAPTER_3[0];
const c3s3 = CHAPTER_3[2];
const c3s4 = CHAPTER_3[3];
const c4s1 = CHAPTER_4[0];
const c4s2 = CHAPTER_4[1];
const c4s4 = CHAPTER_4[3];
const ACTORS_WITH_CHILD = actorsWithChild(LANG);

function rule(over: Partial<Rule> = {}): Rule {
  return {
    id: "r",
    who: { scope: "residents" },
    what: "ask-first",
    when: "always",
    consequence: "return-or-fix",
    subject: "mayim",
    writtenAt: "c1s1",
    ...over,
  };
}

describe("the builder stays closed at 16", () => {
  it("has exactly four options in each field", () => {
    expect(whoOptions(LANG)).toHaveLength(4);
    expect(whatOptions(LANG)).toHaveLength(4);
    expect(whenOptions(LANG)).toHaveLength(4);
    expect(consequenceOptions(LANG)).toHaveLength(4);
  });
});

describe("who a rule reaches", () => {
  it("residents does not cover someone passing through", () => {
    expect(whoCovers(rule({ who: { scope: "residents" } }), ACTORS.noam)).toBe(
      false,
    );
    expect(whoCovers(rule({ who: { scope: "residents" } }), ACTORS.dana)).toBe(
      true,
    );
  });

  it("anyone-present covers someone passing through", () => {
    expect(
      whoCovers(rule({ who: { scope: "anyone-present" } }), ACTORS.noam),
    ).toBe(true);
  });

  it("group covers only members", () => {
    const r = rule({ who: { scope: "group", group: "roim" } });
    expect(whoCovers(r, ACTORS.dana)).toBe(true);
    expect(whoCovers(r, ACTORS.barak)).toBe(false);
  });

  it("everyone-except is the inverse of group", () => {
    const r = rule({ who: { scope: "everyone-except", group: "roim" } });
    expect(whoCovers(r, ACTORS.dana)).toBe(false);
    expect(whoCovers(r, ACTORS.barak)).toBe(true);
  });

  it("covers someone who belongs to two groups at once", () => {
    // שירה is both a child and a shepherd — this is how a rule aimed at one
    // group lands on a person the child was not thinking about.
    expect(
      whoCovers(
        rule({ who: { scope: "group", group: "yeladim" } }),
        ACTORS.shira,
      ),
    ).toBe(true);
    expect(
      whoCovers(rule({ who: { scope: "group", group: "roim" } }), ACTORS.shira),
    ).toBe(true);
  });
});

describe("when a rule bites", () => {
  it("always holds everywhere", () => {
    expect(whenHolds(rule({ when: "always" }), s1)).toBe(true);
  });

  it("when-scarce holds only where water is short", () => {
    expect(whenHolds(rule({ when: "when-scarce" }), s1)).toBe(false);
    expect(whenHolds(rule({ when: "when-scarce" }), s3)).toBe(true);
  });

  it("first-time-forgiven skips a first offence and bites a repeat", () => {
    expect(whenHolds(rule({ when: "first-time-forgiven" }), s1)).toBe(false);
    expect(whenHolds(rule({ when: "first-time-forgiven" }), s3)).toBe(true);
  });
});

describe("rule to situation", () => {
  it("does not apply across subjects", () => {
    expect(ruleApplies(rule({ subject: "shvil" }), s1, ACTORS)).toBe(false);
    expect(ruleApplies(rule({ subject: "mayim" }), s1, ACTORS)).toBe(true);
  });

  it("a residents-only water rule still reaches שירה in situation 3", () => {
    expect(ruleApplies(rule(), s3, ACTORS)).toBe(true);
  });
});

describe("the rule reads as a sentence", () => {
  it("renders the four picks with the inherited subject", () => {
    const text = ruleSentence(
      rule({ who: { scope: "residents" }, what: "ask-first", when: "always" }),
      LANG,
    );
    expect(text).toBe(
      "מי שגר בכפר לא ייקח את המים בלי לבקש, תמיד. אם לא — יצטרך להחזיר או לתקן.",
    );
  });

  it("names the group when the rule is aimed at one", () => {
    const text = ruleSentence(
      rule({
        who: { scope: "everyone-except", group: "roim" },
        subject: "shvil",
        what: "forbidden",
      }),
      LANG,
    );
    expect(text).toContain("כולם חוץ מהרועים");
    expect(text).toContain("לא ייגע בשביל בכלל");
  });

  it("leaves no placeholder unfilled", () => {
    for (const who of whoOptions(LANG)) {
      for (const what of whatOptions(LANG)) {
        const text = ruleSentence(
          rule({ who: { scope: who.value, group: "roim" }, what: what.value }),
          LANG,
        );
        expect(text).not.toContain("{");
      }
    }
  });
});

describe("conflicts caught while writing", () => {
  it("forbidden clashes with by-turn", () => {
    expect(whatClausesClash("forbidden", "by-turn")).toBe(true);
  });

  it("ask-first and by-turn can live together", () => {
    expect(whatClausesClash("ask-first", "by-turn")).toBe(false);
  });

  it("flags a flat contradiction on the same subject and reach", () => {
    const existing = [rule({ id: "old", what: "forbidden" })];
    const found = textualConflict(
      rule({ id: "new", what: "by-turn" }),
      existing,
    );
    expect(found.map((r) => r.id)).toEqual(["old"]);
  });

  it("does not flag rules about different things", () => {
    const existing = [rule({ id: "old", what: "forbidden", subject: "shvil" })];
    expect(
      textualConflict(rule({ id: "new", what: "by-turn" }), existing),
    ).toEqual([]);
  });

  it("does not flag rules with different reach — that one shows up in the field", () => {
    const existing = [
      rule({
        id: "old",
        what: "forbidden",
        who: { scope: "group", group: "roim" },
      }),
    ];
    expect(
      textualConflict(rule({ id: "new", what: "by-turn" }), existing),
    ).toEqual([]);
  });
});

describe("collisions found only by running the situation", () => {
  it("two rules with different reach both land on שירה and pull apart", () => {
    // Neither of these is flagged at write time: different WHO, so the
    // contradiction only exists because שירה is in both groups.
    const rules = [
      rule({
        id: "a",
        what: "forbidden",
        who: { scope: "group", group: "roim" },
      }),
      rule({
        id: "b",
        what: "by-turn",
        who: { scope: "group", group: "yeladim" },
      }),
    ];
    expect(textualConflict(rules[1], [rules[0]])).toEqual([]);

    const collision = fieldCollision(rules, s3, ACTORS);
    expect(collision).not.toBeNull();
    expect(collision!.rules.map((r) => r.id).sort()).toEqual(["a", "b"]);
  });

  it("two rules with different WHEN both hold once water is short", () => {
    const rules = [
      rule({ id: "a", what: "forbidden", when: "when-scarce" }),
      rule({
        id: "b",
        what: "share-equally",
        when: "always",
        who: { scope: "anyone-present" },
      }),
    ];
    expect(fieldCollision(rules, s3, ACTORS)).not.toBeNull();
    // In situation 1 water is not short, so only one of them fires.
    expect(fieldCollision(rules, s1, ACTORS)).toBeNull();
  });

  it("agreeing rules are not a collision", () => {
    const rules = [
      rule({ id: "a", what: "ask-first" }),
      rule({ id: "b", what: "by-turn" }),
    ];
    expect(fieldCollision(rules, s1, ACTORS)).toBeNull();
  });
});

describe("rights are states, not points", () => {
  it("strains, breaks and repairs", () => {
    let board = emptyRightsBoard();
    expect(board[rightsKey("machse", "hadashim")]).toBe("intact");

    board = applyRights(board, [
      { protection: "machse", group: "hadashim", move: "strain" },
    ]);
    expect(board[rightsKey("machse", "hadashim")]).toBe("strained");

    board = applyRights(board, [
      { protection: "machse", group: "hadashim", move: "break" },
    ]);
    expect(board[rightsKey("machse", "hadashim")]).toBe("broken");

    board = applyRights(board, [
      { protection: "machse", group: "hadashim", move: "repair" },
    ]);
    expect(board[rightsKey("machse", "hadashim")]).toBe("intact");
  });

  it("straining something broken does not quietly heal it", () => {
    let board = applyRights(emptyRightsBoard(), [
      { protection: "machse", group: "hadashim", move: "break" },
    ]);
    board = applyRights(board, [
      { protection: "machse", group: "hadashim", move: "strain" },
    ]);
    expect(board[rightsKey("machse", "hadashim")]).toBe("broken");
  });

  it("reports harm with the group named, broken first", () => {
    const board = applyRights(emptyRightsBoard(), [
      { protection: "kinyan", group: "vatikim", move: "strain" },
      { protection: "machse", group: "hadashim", move: "break" },
    ]);
    const list = harmed(board);
    expect(list).toHaveLength(2);
    expect(list[0]).toEqual({
      protection: "machse",
      group: "hadashim",
      state: "broken",
    });
  });
});

describe("trust never surfaces as a number", () => {
  it("maps to three ways a group behaves", () => {
    expect(trustLevel(3)).toBe("comes-to-you");
    expect(trustLevel(2)).toBe("comes-to-you");
    expect(trustLevel(1)).toBe("comes-but");
    expect(trustLevel(0)).toBe("stops-coming");
  });
});

describe("what the child is asked at each situation", () => {
  it("invites a rule when nothing covers the first situation", () => {
    const prompt = promptFor(initialState(), s1, ACTORS, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("write-rule");
  });

  it("applies the rule once one exists", () => {
    const state = addRule(initialState(), rule({ id: "water" }));
    const prompt = promptFor(state, s3, ACTORS, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("rule-applies");
  });

  it("says nothing covers this when a situation that does not invite a rule is uncovered", () => {
    const prompt = promptFor(initialState(), s3, ACTORS, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("no-rule");
  });
});

describe("chapter 1 content holds up", () => {
  it("has four situations, two that invite a rule and two that do not", () => {
    expect(CHAPTER_1).toHaveLength(4);
    expect(CHAPTER_1.filter((s) => s.invitesRule)).toHaveLength(2);
  });

  it("gives every situation an outcome for all four WHAT clauses", () => {
    for (const s of CHAPTER_1) {
      for (const what of whatOptions(LANG)) {
        expect(s.outcomes[what.value], `${s.id} / ${what.value}`).toBeDefined();
      }
    }
  });

  it("pinches: every WHAT clause hurts someone in situation 3 or 4", () => {
    // §7 — for each rule the child can write there is a later situation where
    // applying it costs something. Checked here rather than trusted.
    for (const what of whatOptions(LANG)) {
      const costs = [CHAPTER_1[2], CHAPTER_1[3]].some((s: Situation) => {
        const outcome = s.outcomes[what.value]!;
        return (
          outcome.rights.some((r) => r.move !== "repair") ||
          outcome.trust.some((t) => t.delta < 0)
        );
      });
      expect(costs, `no pinch for ${what.value}`).toBe(true);
    }
  });
});

describe("playing the chapter through", () => {
  it("a forbidden-water rule ends with שירה's belonging broken", () => {
    let state = initialState();
    const water = rule({
      id: "water",
      what: "forbidden",
      who: { scope: "residents" },
    });
    state = addRule(state, water);

    const prompt = promptFor(state, s3, ACTORS, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("rule-applies");

    state = resolve(state, {
      situation: s3,
      governedBy: "forbidden",
      appliedRuleIds: [water.id],
      overrode: false,
    });

    expect(state.rights[rightsKey("shayachut", "yeladim")]).toBe("broken");
    expect(trustLevel(state.trust.yeladim)).toBe("stops-coming");
    expect(state.cursor).toBe(1);
  });

  it("overriding costs equality before the law, not the outcome", () => {
    let state = initialState();
    state = addRule(state, rule({ id: "water" }));
    state = resolve(state, {
      situation: s3,
      governedBy: "ask-first",
      appliedRuleIds: ["water"],
      overrode: true,
    });

    expect(state.rights[rightsKey("shivyon", "vatikim")]).toBe("strained");
    expect(state.log[0].overrode).toBe(true);
    expect(outcomeFor(s3, "ask-first", true)).toBe(s3.overrideOutcome);
  });

  it("a second rule can reach a situation the first one missed", () => {
    let state = initialState();
    state = addRule(state, rule({ id: "water", subject: "mayim" }));
    expect(applicableRules(state.rules, CHAPTER_1[3], ACTORS)).toHaveLength(0);

    state = addRule(
      state,
      rule({ id: "path", subject: "shvil", writtenAt: "c1s2" }),
    );
    expect(applicableRules(state.rules, CHAPTER_1[3], ACTORS)).toHaveLength(1);
  });
});

function precedent(over: Partial<Precedent> = {}): Precedent {
  return {
    id: "p",
    situationId: "c1s2",
    governedBy: "ask-first",
    overrode: false,
    actorId: c1s2.actorId,
    act: c1s2.act,
    justification: c1s2.justification,
    power: c1s2.power,
    subject: c1s2.subject,
    essentialTraits: null,
    ...over,
  };
}

describe("precedent trait matching", () => {
  it("lists all five trait dimensions, in a fixed order", () => {
    expect(TRAIT_KEYS).toEqual([
      "act",
      "justification",
      "power",
      "subject",
      "actor",
    ]);
  });

  it("matches only the requested traits, not all of them", () => {
    const p = precedent();
    expect(traitsMatch(p, c2s3, ["act"])).toBe(true);
    expect(traitsMatch(p, c2s3, ["power"])).toBe(true);
    expect(traitsMatch(p, c2s3, ["justification"])).toBe(false);
  });

  it("requires every requested trait to match, not just one", () => {
    const p = precedent();
    expect(traitsMatch(p, c2s3, ["act", "justification"])).toBe(false);
  });

  it("lists every trait that actually differs", () => {
    const p = precedent();
    expect(traitDifferences(p, c2s3).sort()).toEqual(
      ["actor", "justification", "subject"].sort(),
    );
  });
});

describe("what the child is asked, with a precedent in play", () => {
  function afterC1s2(): GameState {
    return resolve(initialState(), {
      situation: c1s2,
      governedBy: "ask-first",
      appliedRuleIds: [],
      overrode: false,
    });
  }

  it("offers a precedent choice the first time a situation might invoke one", () => {
    const state = afterC1s2();
    const prompt = promptFor(state, c2s3, ACTORS, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("precedent-choice");
  });

  it("reminds once activated with a trait that still holds", () => {
    let state = afterC1s2();
    state = activatePrecedent(state, state.precedents[0].id, ["act"]);
    const prompt = promptFor(state, c2s3, ACTORS, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("precedent-reminder");
  });

  it("falls through with precedent context when the essential trait doesn't hold", () => {
    let state = afterC1s2();
    state = activatePrecedent(state, state.precedents[0].id, ["justification"]);
    const prompt = promptFor(state, c2s3, ACTORS, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("no-rule"); // c2s3.invitesRule is false
    if (prompt.kind === "no-rule") {
      expect(prompt.precedentContext?.differences).toContain("justification");
    }
  });
});

describe("resolving a situation records a precedent", () => {
  it("is essentialTraits: null until asked about", () => {
    const state = resolve(initialState(), {
      situation: s1,
      governedBy: "ask-first",
      appliedRuleIds: [],
      overrode: false,
    });
    expect(state.precedents).toHaveLength(1);
    expect(state.precedents[0]).toMatchObject({
      situationId: "c1s1",
      governedBy: "ask-first",
      essentialTraits: null,
    });
  });
});

describe("chapter 2 content holds up", () => {
  it("has four situations, two that invite a rule and two that do not", () => {
    expect(CHAPTER_2).toHaveLength(4);
    expect(CHAPTER_2.filter((s) => s.invitesRule)).toHaveLength(2);
  });

  it("gives every situation an outcome for all four WHAT clauses", () => {
    for (const s of CHAPTER_2) {
      for (const what of whatOptions(LANG)) {
        expect(s.outcomes[what.value], `${s.id} / ${what.value}`).toBeDefined();
      }
    }
  });

  it("c2s1 and c2s2 are fresh cases with no precedent link", () => {
    expect(c2s1.precedentOf).toBeUndefined();
    expect(CHAPTER_2[1].precedentOf).toBeUndefined();
  });

  it("c2s3 and c2s4 both point at the same precedent source, not at each other", () => {
    expect(c2s3.precedentOf).toBe("c1s2");
    expect(c2s4.precedentOf).toBe("c1s2");
  });

  it("c2s3's precedent options are each true of its own source", () => {
    const source = SITUATIONS_BY_ID[c2s3.precedentOf!];
    const synthetic = precedent({ situationId: source.id });
    for (const option of c2s3.precedentOptions ?? []) {
      expect(traitsMatch(synthetic, c2s3, option.traits)).toBe(true);
    }
    expect(c2s3.precedentOptions?.length).toBeGreaterThan(0);
  });

  it("c2s4 matches the c1s2 precedent on act but not on power", () => {
    const synthetic = precedent();
    expect(traitsMatch(synthetic, c2s4, ["act"])).toBe(true);
    expect(traitsMatch(synthetic, c2s4, ["power"])).toBe(false);
  });
});

describe("playing chapter 2 through", () => {
  function afterC1s2(): GameState {
    return resolve(initialState(), {
      situation: c1s2,
      governedBy: "ask-first",
      appliedRuleIds: [],
      overrode: false,
    });
  }

  it("picking act at c2s3 leads to a reminder at c2s4", () => {
    let state = afterC1s2();
    const choice = promptFor(state, c2s3, ACTORS, SITUATIONS_BY_ID);
    if (choice.kind !== "precedent-choice")
      throw new Error("expected a choice");
    state = activatePrecedent(state, choice.precedent.id, ["act"]);

    const atC2s3 = promptFor(state, c2s3, ACTORS, SITUATIONS_BY_ID);
    expect(atC2s3.kind).toBe("precedent-reminder");
    if (atC2s3.kind !== "precedent-reminder")
      throw new Error("expected a reminder");
    state = resolve(state, {
      situation: c2s3,
      governedBy: atC2s3.precedent.governedBy,
      appliedRuleIds: [],
      overrode: false,
    });

    const atC2s4 = promptFor(state, c2s4, ACTORS, SITUATIONS_BY_ID);
    expect(atC2s4.kind).toBe("precedent-reminder");
  });

  it("picking power at c2s3 leads to a precedent-flagged no-rule at c2s4", () => {
    let state = afterC1s2();
    const choice = promptFor(state, c2s3, ACTORS, SITUATIONS_BY_ID);
    if (choice.kind !== "precedent-choice")
      throw new Error("expected a choice");
    state = activatePrecedent(state, choice.precedent.id, ["power"]);

    const atC2s3 = promptFor(state, c2s3, ACTORS, SITUATIONS_BY_ID);
    expect(atC2s3.kind).toBe("precedent-reminder"); // power still holds for c2s3 itself
    if (atC2s3.kind !== "precedent-reminder")
      throw new Error("expected a reminder");
    state = resolve(state, {
      situation: c2s3,
      governedBy: atC2s3.precedent.governedBy,
      appliedRuleIds: [],
      overrode: false,
    });

    const atC2s4 = promptFor(state, c2s4, ACTORS, SITUATIONS_BY_ID);
    expect(atC2s4.kind).toBe("no-rule");
    if (atC2s4.kind === "no-rule") {
      expect(atC2s4.precedentContext?.differences).toContain("power");
    }
  });
});

describe("moving between chapters", () => {
  it("advances the chapter number and keeps everything else", () => {
    let state = initialState();
    state = addRule(state, rule({ id: "water" }));
    state = advanceChapter(state);
    expect(state.chapter).toBe(2);
    expect(state.rules).toHaveLength(1);
  });
});

describe("the child as an actor (§9 chapter 3)", () => {
  it("is never part of the shared ACTORS registry LinkedText scans", () => {
    // The regression this guards against: merging CHILD_ACTOR into ACTORS
    // would make LinkedText linkify "אתה" (you) everywhere in the game's
    // ordinary narration — one of the most common words in Hebrew.
    expect(Object.values(ACTORS)).not.toContain(CHILD_ACTOR);
    expect(ACTORS.you).toBeUndefined();
  });

  it("has no group, so residents/anyone-present cover it but a group scope never does", () => {
    expect(whoCovers(rule({ who: { scope: "residents" } }), CHILD_ACTOR)).toBe(
      true,
    );
    expect(
      whoCovers(rule({ who: { scope: "anyone-present" } }), CHILD_ACTOR),
    ).toBe(true);
    expect(
      whoCovers(
        rule({ who: { scope: "group", group: "vatikim" } }),
        CHILD_ACTOR,
      ),
    ).toBe(false);
  });

  it("can never be the excluded group, so everyone-except always covers it", () => {
    for (const group of GROUPS) {
      expect(
        whoCovers(
          rule({ who: { scope: "everyone-except", group } }),
          CHILD_ACTOR,
        ),
      ).toBe(true);
    }
  });
});

describe("chapter 3 content holds up", () => {
  it("has four situations", () => {
    expect(CHAPTER_3).toHaveLength(4);
  });

  it("gives every situation an outcome for all four WHAT clauses", () => {
    for (const s of CHAPTER_3) {
      for (const what of whatOptions(LANG)) {
        expect(s.outcomes[what.value], `${s.id} / ${what.value}`).toBeDefined();
      }
    }
  });

  it("c3s1 and c3s4 target the child directly", () => {
    expect(c3s1.actorId).toBe("you");
    expect(c3s4.actorId).toBe("you");
  });
});

describe("playing chapter 3 through", () => {
  it("a water rule from chapter 1 reaches the child at c3s1", () => {
    let state = initialState();
    state = addRule(
      state,
      rule({ id: "water", subject: "mayim", who: { scope: "residents" } }),
    );
    const prompt = promptFor(state, c3s1, ACTORS_WITH_CHILD, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("rule-applies");
  });

  it("falls through to no-rule at c3s1 when no water rule was ever written", () => {
    const prompt = promptFor(
      initialState(),
      c3s1,
      ACTORS_WITH_CHILD,
      SITUATIONS_BY_ID,
    );
    expect(prompt.kind).toBe("no-rule");
  });

  it("an everyone-except chefetz rule written at c3s3 still reaches the child at c3s4", () => {
    let state = initialState();
    state = addRule(
      state,
      rule({
        id: "rope",
        subject: "chefetz",
        who: { scope: "everyone-except", group: "banaim" },
        writtenAt: "c3s3",
      }),
    );
    const prompt = promptFor(state, c3s4, ACTORS_WITH_CHILD, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("rule-applies");
  });

  it("a group-scoped chefetz rule does not reach the child at c3s4", () => {
    let state = initialState();
    state = addRule(
      state,
      rule({
        id: "rope",
        subject: "chefetz",
        who: { scope: "group", group: "banaim" },
        writtenAt: "c3s3",
      }),
    );
    const prompt = promptFor(state, c3s4, ACTORS_WITH_CHILD, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("no-rule");
  });
});

describe("the notebook holds up", () => {
  const BUILT_CHAPTERS = [
    CHAPTER_1,
    CHAPTER_2,
    CHAPTER_3,
    CHAPTER_4,
    CHAPTER_5,
  ];

  it("has exactly one note per built chapter, numbered in order", () => {
    expect(CHAPTER_NOTES).toHaveLength(BUILT_CHAPTERS.length);
    expect(CHAPTER_NOTES.map((n) => n.chapter)).toEqual([1, 2, 3, 4, 5]);
  });

  it("fills every field — a missing token would surface as its own key", () => {
    for (const note of CHAPTER_NOTES) {
      const strings = [
        note.concept,
        note.whatHappened,
        note.grownUp,
        ...note.questions,
      ];
      for (const s of strings) {
        expect(s.length).toBeGreaterThan(0);
        // t() falls back to the key itself when a token is missing.
        expect(s).not.toMatch(/^notes\./);
      }
    }
  });

  it("gives every chapter at least two questions to talk about", () => {
    for (const note of CHAPTER_NOTES) {
      expect(note.questions.length).toBeGreaterThanOrEqual(2);
      expect(new Set(note.questions).size).toBe(note.questions.length);
    }
  });
});

describe("chapter 4 content holds up", () => {
  it("has four situations", () => {
    expect(CHAPTER_4).toHaveLength(4);
  });

  it("gives every situation an outcome for all four WHAT clauses", () => {
    for (const s of CHAPTER_4) {
      for (const what of whatOptions(LANG)) {
        expect(s.outcomes[what.value], `${s.id} / ${what.value}`).toBeDefined();
      }
    }
  });

  it("never lets the passers-through speak", () => {
    // §4: "אין להם קול בכלל". What נעם did, or what was done to him, is
    // always reported by somebody else — he never opens a scene.
    for (const s of CHAPTER_4) {
      expect(s.speakerGroup, s.id).not.toBe("ovrim");
    }
  });

  it("puts נעם on both sides: once as the actor, once as the one harmed", () => {
    expect(c4s1.actorId).toBe("noam");
    expect(c4s2.victimId).toBe("noam");
    expect(c4s4.actorId).toBe("noam");
  });

  it("is the first chapter to move a right belonging to the passers-through", () => {
    // §8's own example is "הזכות לקניין שבורה — אצל העוברים", and it has
    // nowhere to appear before this chapter.
    const earlier = [...CHAPTER_1, ...CHAPTER_2, ...CHAPTER_3];
    const touchesOvrim = (s: Situation) =>
      [s.noRuleOutcome, s.overrideOutcome, ...Object.values(s.outcomes)].some(
        (o) => o?.rights.some((r) => r.group === "ovrim"),
      );
    expect(earlier.some(touchesOvrim)).toBe(false);
    expect(CHAPTER_4.some(touchesOvrim)).toBe(true);
  });

  it("names the concept only at the chapter's end, not in a situation", () => {
    // §2: felt first, named afterwards. The epilogue is the one place both
    // halves are said together.
    const epilogue = chapter4(LANG).epilogue;
    expect(epilogue).toBeTruthy();
    expect(chapter1(LANG).epilogue).toBeUndefined();
  });
});

describe("§6's two outcomes are both reachable at c4s1", () => {
  function waterRule(who: Rule["who"]): Rule {
    return rule({ id: "water", subject: "mayim", who, writtenAt: "c1s1" });
  }

  it("a residents rule leaves the gap: nothing reaches him", () => {
    const state = addRule(initialState(4), waterRule({ scope: "residents" }));
    const prompt = promptFor(state, c4s1, ACTORS_WITH_CHILD, SITUATIONS_BY_ID);
    expect(prompt.kind).toBe("no-rule");
  });

  it("a group rule leaves the same gap — he belongs to no village group", () => {
    const state = addRule(
      initialState(4),
      waterRule({ scope: "group", group: "roim" }),
    );
    expect(
      promptFor(state, c4s1, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("no-rule");
  });

  it("an anyone-present rule reaches him, and he pays under it", () => {
    const state = addRule(
      initialState(4),
      waterRule({ scope: "anyone-present" }),
    );
    expect(
      promptFor(state, c4s1, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("rule-applies");
  });

  it("an everyone-except rule reaches him unless it excludes his own group", () => {
    const reaches = addRule(
      initialState(4),
      waterRule({ scope: "everyone-except", group: "roim" }),
    );
    expect(
      promptFor(reaches, c4s1, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("rule-applies");

    const excludesHim = addRule(
      initialState(4),
      waterRule({ scope: "everyone-except", group: "ovrim" }),
    );
    expect(
      promptFor(excludesHim, c4s1, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("no-rule");
  });

  it("c4s4's no-rule copy has to serve two different silences", () => {
    // It fires when the child wrote no shetach rule at all, and when they
    // wrote one that doesn't reach him. The copy must not claim a rule
    // exists — this test is here to say why if anyone rewrites it.
    const wroteNothing = initialState(4);
    expect(
      promptFor(wroteNothing, c4s4, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("no-rule");

    const wroteOneThatMissesHim = addRule(
      initialState(4),
      rule({ id: "ground", subject: "shetach", who: { scope: "residents" } }),
    );
    expect(
      promptFor(
        wroteOneThatMissesHim,
        c4s4,
        ACTORS_WITH_CHILD,
        SITUATIONS_BY_ID,
      ).kind,
    ).toBe("no-rule");
  });

  it("the covered branch is what puts העוברים on the rights board", () => {
    const covered = outcomeFor(c4s1, "forbidden", false);
    expect(covered.rights.some((r) => r.group === "ovrim")).toBe(true);
    // The gap costs the village instead — nobody's rule was broken, but
    // יותם stops trusting that anything here is settled.
    const gap = outcomeFor(c4s1, null, false);
    expect(gap.rights.every((r) => r.group !== "ovrim")).toBe(true);
    expect(gap.trust).toContainEqual({ group: "vatikim", delta: -1 });
  });
});

describe("a rule binds by who acted, so it can protect someone it never binds", () => {
  it("a residents-only rule covers ברק at c4s2, though נעם is the one harmed", () => {
    // ruleApplies checks the actor's coverage. נעם is never bound by this
    // rule, and is protected by it anyway — without having been asked.
    const state = addRule(
      initialState(4),
      rule({ id: "things", subject: "chefetz", who: { scope: "residents" } }),
    );
    expect(
      promptFor(state, c4s2, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("rule-applies");
    expect(whoCovers(state.rules[0], ACTORS.noam)).toBe(false);
  });
});

describe("§7's line, said once, on the second override", () => {
  function overrode(state: GameState, situation: Situation): GameState {
    return resolve(state, {
      situation,
      governedBy: "ask-first",
      appliedRuleIds: ["r"],
      overrode: true,
    });
  }

  it("stays quiet on the first override and speaks on the second", () => {
    let state = initialState();
    expect(saysOverrideNote(state, true)).toBe(false);

    state = overrode(state, s1);
    // Second override: this is the one the village names.
    expect(saysOverrideNote(state, true)).toBe(true);
  });

  it("never speaks when the child is not overriding", () => {
    const state = overrode(initialState(), s1);
    expect(saysOverrideNote(state, false)).toBe(false);
  });

  it("is said once, and not again on a third override", () => {
    let state = overrode(initialState(), s1);
    expect(state.sawOverrideNote).toBe(false);

    state = overrode(state, c1s2);
    expect(state.sawOverrideNote).toBe(true);
    expect(saysOverrideNote(state, true)).toBe(false);

    state = overrode(state, s3);
    expect(saysOverrideNote(state, true)).toBe(false);
  });
});

describe("chapter 5 content holds up", () => {
  it("has four situations, one of which asks who decides", () => {
    expect(CHAPTER_5).toHaveLength(4);
    expect(CHAPTER_5.filter((s) => s.invitesAuthority)).toHaveLength(1);
  });

  it("never asks for an ordinary rule and the authority rule at once", () => {
    for (const s of CHAPTER_5) {
      expect(s.invitesAuthority && s.invitesRule, s.id).toBeFalsy();
    }
  });

  it("gives every situation an outcome for all four WHAT clauses", () => {
    for (const s of CHAPTER_5) {
      for (const what of whatOptions(LANG)) {
        expect(s.outcomes[what.value], `${s.id} / ${what.value}`).toBeDefined();
      }
    }
  });

  it("covers every authority form at the situation that tests it", () => {
    // c5s3 is where whatever was written about authority actually bites, so
    // every form the builder offers needs somewhere to land — including both
    // sides of the election, which are different things to live through.
    const variants = CHAPTER_5[2].variantOutcomes ?? {};
    expect(Object.keys(variants).sort()).toEqual([
      "each-alone",
      "most-senior",
      "two-together",
      "village-chooses-lost",
      "village-chooses-won",
      "you",
    ]);
  });

  it("covers both sides of losing at the situation that lives with it", () => {
    expect(Object.keys(CHAPTER_5[3].variantOutcomes ?? {}).sort()).toEqual([
      "other-decides",
      "you-decide",
    ]);
  });
});

describe("who votes", () => {
  it("leaves the passers-through out when the rule is for residents", () => {
    const eligible = eligibleGroups({ scope: "residents" });
    expect(eligible).not.toContain("ovrim");
    expect(eligible).toHaveLength(GROUPS.length - 1);
  });

  it("includes everyone when the rule reaches anyone present", () => {
    expect(eligibleGroups({ scope: "anyone-present" })).toEqual(GROUPS);
  });

  it("narrows to one group, or to everyone but one", () => {
    expect(eligibleGroups({ scope: "group", group: "roim" })).toEqual(["roim"]);
    expect(
      eligibleGroups({ scope: "everyone-except", group: "roim" }),
    ).not.toContain("roim");
  });
});

describe("the election", () => {
  function withTrust(trust: Partial<Record<(typeof GROUPS)[number], number>>) {
    const state = initialState(5);
    return { ...state, trust: { ...state.trust, ...trust } };
  }

  it("counts a group that comes to you first as a vote for you", () => {
    // Everyone starts trusting the child, so an untouched game is a sweep.
    const result = runElection(initialState(5), { scope: "anyone-present" });
    expect(result.votedFor).toEqual(GROUPS);
    expect(result.votedAgainst).toEqual([]);
    expect(result.won).toBe(true);
  });

  it("counts a group that stopped coming as a vote against", () => {
    const state = withTrust({
      vatikim: 0,
      roim: 0,
      banaim: 0,
      yeladim: 0,
      hadashim: 0,
      ovrim: 0,
    });
    const result = runElection(state, { scope: "anyone-present" });
    expect(result.votedAgainst).toEqual(GROUPS);
    expect(result.won).toBe(false);
  });

  it("lets a half-trusting group abstain rather than count against you", () => {
    const state = withTrust({ vatikim: 1, roim: 1 });
    const result = runElection(state, { scope: "anyone-present" });
    expect(result.abstained).toEqual(["vatikim", "roim"]);
    expect(result.votedFor).not.toContain("vatikim");
    expect(result.votedAgainst).not.toContain("vatikim");
  });

  it("keeps the incumbent on a tie — nobody voted them out", () => {
    const state = withTrust({ vatikim: 0, roim: 0, banaim: 0 });
    const result = runElection(state, { scope: "anyone-present" });
    expect(result.votedFor).toHaveLength(3);
    expect(result.votedAgainst).toHaveLength(3);
    expect(result.won).toBe(true);
  });

  it("is decided only by the groups the WHO field let vote", () => {
    // The passers-through are against, and it changes nothing, because a
    // residents-scoped rule never gave them a voice (§6).
    const state = withTrust({ ovrim: 0 });
    expect(runElection(state, { scope: "residents" }).eligible).not.toContain(
      "ovrim",
    );
    expect(
      runElection(state, { scope: "anyone-present" }).votedAgainst,
    ).toEqual(["ovrim"]);
  });
});

describe("who decides, once it is written down", () => {
  it("keeps the child deciding when they wrote that they decide", () => {
    const state = setAuthority(initialState(5), {
      form: "you",
      who: { scope: "residents" },
    });
    expect(state.decider).toBe("you");
    expect(state.election).toBeNull();
    expect(canOverride(state)).toBe(true);
  });

  it("hands it away when the most senior decides — that is not the child", () => {
    const state = setAuthority(initialState(5), {
      form: "most-senior",
      who: { scope: "residents" },
    });
    expect(state.decider).toBe("other");
    expect(canOverride(state)).toBe(false);
  });

  it("keeps the child nominally in place when each decides for themselves", () => {
    // The cost of this one lands in the outcomes, not in the role.
    expect(deciderFor("each-alone", null)).toBe("you");
    expect(deciderFor("two-together", null)).toBe("you");
  });

  it("runs the vote, and hands the role over if it is lost", () => {
    const burnt = initialState(5);
    const state = setAuthority(
      {
        ...burnt,
        trust: {
          ...burnt.trust,
          vatikim: 0,
          roim: 0,
          banaim: 0,
          yeladim: 0,
          hadashim: 0,
        },
      },
      { form: "village-chooses", who: { scope: "residents" } },
    );
    expect(state.election?.won).toBe(false);
    expect(state.decider).toBe("other");
  });
});

describe("losing is real, and the game goes on under it", () => {
  const lost = setAuthority(initialState(5), {
    form: "most-senior",
    who: { scope: "residents" },
  });

  it("stops the child writing rules into the book", () => {
    const situation = { ...c1s2, invitesRule: true };
    expect(
      promptFor(lost, situation, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("no-rule");
  });

  it("still applies the rules the child already wrote, to the child", () => {
    const state = addRule(lost, rule({ subject: "mayim" }));
    expect(promptFor(state, s1, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind).toBe(
      "rule-applies",
    );
    // The rule holds; the child just no longer chooses whether to apply it.
    expect(canOverride(state)).toBe(false);
  });

  it("branches the outcome on who decides, not on the WHAT clause", () => {
    const c5s4 = CHAPTER_5[3];
    const mine = outcomeFor(c5s4, "ask-first", false, variantKeys(lost));
    const kept = outcomeFor(
      c5s4,
      "ask-first",
      false,
      variantKeys(initialState(5)),
    );
    expect(mine.text).toBe(c5s4.variantOutcomes!["other-decides"].text);
    expect(kept.text).toBe(c5s4.variantOutcomes!["you-decide"].text);
  });

  it("tells c5s3 apart by which form was written", () => {
    for (const form of [
      "you",
      "most-senior",
      "two-together",
      "each-alone",
    ] as const) {
      const state = setAuthority(initialState(5), {
        form,
        who: { scope: "residents" },
      });
      expect(authorityVariant(state)).toBe(form);
    }
  });

  it("tells winning and losing the same vote apart", () => {
    const base = initialState(5);
    const won = setAuthority(base, {
      form: "village-chooses",
      who: { scope: "residents" },
    });
    expect(authorityVariant(won)).toBe("village-chooses-won");

    const lostVote = setAuthority(
      {
        ...base,
        trust: {
          ...base.trust,
          vatikim: 0,
          roim: 0,
          banaim: 0,
          yeladim: 0,
          hadashim: 0,
        },
      },
      { form: "village-chooses", who: { scope: "residents" } },
    );
    expect(authorityVariant(lostVote)).toBe("village-chooses-lost");
  });
});

describe("the book closes", () => {
  it("asks who decides before anything else at c5s2", () => {
    // c5s2 must not be shadowed by an ordinary rule that happens to fire.
    const c5s2 = CHAPTER_5[1];
    const state = addRule(initialState(5), rule({ subject: "mayim" }));
    expect(
      promptFor(state, c5s2, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("write-authority");
  });

  it("says the line was written, not that nothing was", () => {
    // The outcome of c5s2 turns on whether the line now exists at all; a
    // playthrough caught it still reading "you wrote nothing" after the
    // child had just written it.
    const c5s2 = CHAPTER_5[1];
    const wrote = setAuthority(initialState(5), {
      form: "each-alone",
      who: { scope: "residents" },
    });
    expect(outcomeFor(c5s2, null, false, variantKeys(wrote)).text).toBe(
      c5s2.variantOutcomes!["authority-written"].text,
    );
    // Declining is still a real answer, and keeps its own outcome.
    expect(
      outcomeFor(c5s2, null, false, variantKeys(initialState(5))).text,
    ).toBe(c5s2.noRuleOutcome.text);
  });

  it("asks only once", () => {
    const c5s2 = CHAPTER_5[1];
    const answered = setAuthority(initialState(5), {
      form: "you",
      who: { scope: "residents" },
    });
    expect(
      promptFor(answered, c5s2, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).not.toBe("write-authority");
  });

  it("swaps one rule in place, keeping the book's order and length", () => {
    let state = addRule(initialState(5), rule({ id: "a", subject: "mayim" }));
    state = addRule(state, rule({ id: "b", subject: "shvil" }));
    state = replaceRule(state, "a", rule({ id: "ignored", what: "forbidden" }));

    expect(state.rules).toHaveLength(2);
    expect(state.rules.map((r) => r.id)).toEqual(["a", "b"]);
    expect(state.rules[0].what).toBe("forbidden");
  });

  it("stops anything else being written once it is closed", () => {
    const closed = closeBook(initialState(5), "two-agree");
    expect(closed.bookClosed).toBe(true);
    expect(closed.amendment).toBe("two-agree");

    const situation = { ...c1s2, invitesRule: true };
    expect(
      promptFor(closed, situation, ACTORS_WITH_CHILD, SITUATIONS_BY_ID).kind,
    ).toBe("no-rule");
  });
});
