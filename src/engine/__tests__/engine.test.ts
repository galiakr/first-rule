import { describe, expect, it } from "vitest";

import { CHAPTER_1 } from "@/content/chapter1";
import { CHAPTER_2 } from "@/content/chapter2";
import { SITUATIONS_BY_ID } from "@/content/situations";
import { ACTORS } from "@/content/village";
import { fieldCollision, textualConflict, whatClausesClash } from "../conflict";
import {
  activatePrecedent,
  addRule,
  advanceChapter,
  initialState,
  outcomeFor,
  promptFor,
  resolve,
} from "../game";
import {
  applicableRules,
  ruleApplies,
  ruleSentence,
  whenHolds,
  whoCovers,
} from "../match";
import {
  CONSEQUENCE_OPTIONS,
  WHAT_OPTIONS,
  WHEN_OPTIONS,
  WHO_OPTIONS,
} from "../options";
import { TRAIT_KEYS, traitDifferences, traitsMatch } from "../precedent";
import {
  applyRights,
  emptyRightsBoard,
  harmed,
  rightsKey,
  trustLevel,
} from "../rights";
import type { GameState, Precedent, Rule, Situation } from "../types";

const s1 = CHAPTER_1[0];
const s3 = CHAPTER_1[2];
const c1s2 = CHAPTER_1[1];
const c2s1 = CHAPTER_2[0];
const c2s3 = CHAPTER_2[2];
const c2s4 = CHAPTER_2[3];

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
    expect(WHO_OPTIONS).toHaveLength(4);
    expect(WHAT_OPTIONS).toHaveLength(4);
    expect(WHEN_OPTIONS).toHaveLength(4);
    expect(CONSEQUENCE_OPTIONS).toHaveLength(4);
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
    );
    expect(text).toContain("כולם חוץ מהרועים");
    expect(text).toContain("לא ייגע בשביל בכלל");
  });

  it("leaves no placeholder unfilled", () => {
    for (const who of WHO_OPTIONS) {
      for (const what of WHAT_OPTIONS) {
        const text = ruleSentence(
          rule({ who: { scope: who.value, group: "roim" }, what: what.value }),
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
      for (const what of WHAT_OPTIONS) {
        expect(s.outcomes[what.value], `${s.id} / ${what.value}`).toBeDefined();
      }
    }
  });

  it("pinches: every WHAT clause hurts someone in situation 3 or 4", () => {
    // §7 — for each rule the child can write there is a later situation where
    // applying it costs something. Checked here rather than trusted.
    for (const what of WHAT_OPTIONS) {
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
      for (const what of WHAT_OPTIONS) {
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
