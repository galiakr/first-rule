import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AboutVillage from "@/components/AboutVillage";
import AmendmentAttempt from "@/components/AmendmentAttempt";
import AuthorityBuilder from "@/components/AuthorityBuilder";
import BookClosing from "@/components/BookClosing";
import ChapterEnd from "@/components/ChapterEnd";
import ElectionResult from "@/components/ElectionResult";
import KeyMoments from "@/components/KeyMoments";
import PrecedentChoice from "@/components/PrecedentChoice";
import RuleBuilder from "@/components/RuleBuilder";
import SeparationBuilder from "@/components/SeparationBuilder";
import TableOfContents from "@/components/TableOfContents";
import { chapters, situationsById } from "@/content/situations";
import { DEFAULT_LANG, translator } from "@/content/tokens";
import { actors } from "@/content/village";
import { assignSeparation, keyMoments } from "@/engine/separation";
import { addRule, initialState, resolve } from "@/engine/game";
import { ruleSentence } from "@/engine/match";
import { setAuthority } from "@/engine/authority";
import { makeSave } from "@/engine/save";
import type { GameState, Rule } from "@/engine/types";
import { renderWithLanguage } from "@/test/render";

const t = translator(DEFAULT_LANG);
const ALL = chapters(DEFAULT_LANG);
const BY_ID = situationsById(DEFAULT_LANG);
const PEOPLE = actors(DEFAULT_LANG);

const RULE: Rule = {
  id: "water",
  who: { scope: "residents" },
  what: "ask-first",
  when: "always",
  consequence: "return-or-fix",
  subject: "water",
  writtenAt: "c1s1",
};

describe("AboutVillage", () => {
  it("names the six groups and lets the child name the village", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    renderWithLanguage(
      <AboutVillage
        saved={null}
        onResume={() => {}}
        onDiscard={() => {}}
        onContinue={onContinue}
      />,
    );

    expect(
      screen.getByText(t("village.groups.passers-through.label")),
    ).toBeVisible();
    await user.type(screen.getByLabelText(t("about.name_prompt")), "עין חרוד");
    await user.click(
      screen.getByRole("button", { name: t("about.enter_village") }),
    );
    expect(onContinue).toHaveBeenCalledWith("עין חרוד");
  });

  it("falls back to a plain name when the child leaves it blank", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    renderWithLanguage(
      <AboutVillage
        saved={null}
        onResume={() => {}}
        onDiscard={() => {}}
        onContinue={onContinue}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: t("about.enter_village") }),
    );
    expect(onContinue).toHaveBeenCalledWith(t("about.name_placeholder"));
  });

  it("offers a half-played village by name instead of the opening screen", () => {
    const saved = makeSave({
      state: initialState(3),
      villageName: "עין חרוד",
      chapterIndex: 2,
      index: 1,
      phase: "situation",
    });
    renderWithLanguage(
      <AboutVillage
        saved={saved}
        onResume={() => {}}
        onDiscard={() => {}}
        onContinue={() => {}}
      />,
    );
    expect(screen.getByText(/עין חרוד/)).toBeVisible();
    // The naming field is not on screen — the child already named this one.
    expect(
      screen.queryByLabelText(t("about.name_prompt")),
    ).not.toBeInTheDocument();
  });

  it("asks before throwing a village away, and can be backed out of", async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    const saved = makeSave({
      state: initialState(),
      villageName: "x",
      chapterIndex: 0,
      index: 0,
      phase: "intro",
    });
    renderWithLanguage(
      <AboutVillage
        saved={saved}
        onResume={() => {}}
        onDiscard={onDiscard}
        onContinue={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: t("save.restart") }));
    expect(screen.getByText(t("save.restart_confirm"))).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: t("save.restart_no") }),
    );
    expect(onDiscard).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: t("save.restart") }));
    await user.click(
      screen.getByRole("button", { name: t("save.restart_yes") }),
    );
    expect(onDiscard).toHaveBeenCalledOnce();
  });
});

describe("RuleBuilder", () => {
  it("assembles the sentence as the child picks, and writes it", async () => {
    const user = userEvent.setup();
    const onWrite = vi.fn();
    renderWithLanguage(
      <RuleBuilder
        subject="water"
        situationId="c1s1"
        existingRules={[]}
        onWrite={onWrite}
        onSkip={() => {}}
      />,
    );

    // Blanks stand in for the parts not yet chosen, so the shape of the rule
    // is visible from the start.
    expect(screen.getByText(t("builder.blank_who"))).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: t("builder.who.residents.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.what.ask_first.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.when.always.label") }),
    );
    await user.click(
      screen.getByRole("button", {
        name: t("builder.consequence.return_or_fix.label"),
      }),
    );

    expect(screen.queryByText(t("builder.blank_who"))).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: t("builder.write") }));

    expect(onWrite).toHaveBeenCalledOnce();
    const written = onWrite.mock.calls[0][0] as Rule;
    expect(written.subject).toBe("water");
    expect(written.who.scope).toBe("residents");
    expect(written.what).toBe("ask-first");
  });

  it("asks which group only when the scope needs one", async () => {
    const user = userEvent.setup();
    renderWithLanguage(
      <RuleBuilder
        subject="water"
        situationId="c1s1"
        existingRules={[]}
        onWrite={() => {}}
        onSkip={() => {}}
      />,
    );
    expect(
      screen.queryByText(t("builder.legend_group")),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: t("builder.who.group.label") }),
    );
    expect(screen.getByText(t("builder.legend_group"))).toBeVisible();
  });

  it("warns when the drafted rule contradicts one already written", async () => {
    const user = userEvent.setup();
    renderWithLanguage(
      <RuleBuilder
        subject="water"
        situationId="c1s3"
        existingRules={[RULE]}
        onWrite={() => {}}
        onSkip={() => {}}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.who.residents.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.what.forbidden.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.when.always.label") }),
    );
    await user.click(
      screen.getByRole("button", {
        name: t("builder.consequence.return_or_fix.label"),
      }),
    );
    // Shown, not blocked: both may stay in the book, and someone decides.
    expect(screen.getByText(t("builder.clash_intro"))).toBeVisible();
    expect(
      screen.getByRole("button", { name: t("builder.write") }),
    ).toBeEnabled();
  });

  it("lets the child decline to write anything", async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    renderWithLanguage(
      <RuleBuilder
        subject="water"
        situationId="c1s1"
        existingRules={[]}
        onWrite={() => {}}
        onSkip={onSkip}
      />,
    );
    await user.click(screen.getByRole("button", { name: t("builder.skip") }));
    expect(onSkip).toHaveBeenCalledOnce();
  });
});

describe("TableOfContents", () => {
  const entries = ALL.map((c, i) => ({
    title: c.title,
    intro: c.intro,
    situations: c.situations,
    readCount: i === 0 ? 2 : 0,
  }));

  it("opens a scene that has been read, and refuses one that hasn't", async () => {
    const user = userEvent.setup();
    renderWithLanguage(
      <TableOfContents open onClose={() => {}} chapters={entries} />,
    );

    const read = screen.getByRole("button", {
      name: new RegExp(ALL[0].situations[0].title),
    });
    const unread = screen.getByRole("button", {
      name: new RegExp(ALL[0].situations[3].title),
    });
    expect(unread).toBeDisabled();

    await user.click(read);
    // The scene renders through LinkedText, which puts every character name
    // in its own node, so match a fragment that doesn't straddle one.
    expect(screen.getByText(/בקצה השדה שלו/)).toBeVisible();
  });

  it("can always go back to the village, and back to the list", async () => {
    const user = userEvent.setup();
    renderWithLanguage(
      <TableOfContents open onClose={() => {}} chapters={entries} />,
    );
    await user.click(
      screen.getByRole("button", { name: new RegExp(ALL[0].title) }),
    );
    expect(screen.getByText(ALL[0].intro)).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: t("common.back_to_list") }),
    );
    expect(
      screen.getByRole("button", { name: new RegExp(ALL[1].title) }),
    ).toBeVisible();
  });

  it("renders nothing while closed", () => {
    const { container } = renderWithLanguage(
      <TableOfContents open={false} onClose={() => {}} chapters={entries} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ChapterEnd", () => {
  function harmed(): GameState {
    return resolve(addRule(initialState(), RULE), {
      situation: ALL[0].situations[2],
      governedBy: "forbidden",
      appliedRuleIds: ["water"],
      overrode: false,
      kind: "applied-rule",
    });
  }

  it("reads the book back, and names who the rules left out", () => {
    renderWithLanguage(<ChapterEnd state={harmed()} onContinue={() => {}} />);
    expect(screen.getByText(ruleSentence(RULE, DEFAULT_LANG))).toBeVisible();
    expect(screen.getByText(t("chapter_end.left_out_heading"))).toBeVisible();
  });

  it("says plainly when no rule was written at all", () => {
    renderWithLanguage(<ChapterEnd state={initialState()} />);
    expect(screen.getByText(t("chapter_end.no_rules"))).toBeVisible();
    expect(screen.getByText(t("chapter_end.no_harm"))).toBeVisible();
  });

  it("shows who holds the three jobs, once they are staffed", () => {
    const staffed = assignSeparation(initialState(6), {
      legislative: { kind: "you" },
      judicial: { kind: "actor", actorId: "yotam" },
      executive: { kind: "village" },
    });
    renderWithLanguage(<ChapterEnd state={staffed} />);
    expect(screen.getByText(t("chapter_end.separation_heading"))).toBeVisible();
    expect(screen.getByText(PEOPLE.yotam.name)).toBeVisible();
  });

  it("closes the game with the cost, not with a score", () => {
    const ended: GameState = {
      ...initialState(7),
      amendmentResult: "refused-unchangeable",
    };
    renderWithLanguage(<ChapterEnd state={ended} finale epilogue="…" />);
    expect(screen.getByText(t("ending.heading"))).toBeVisible();
    expect(
      screen.getByText(t("ending.cost.refused-unchangeable")),
    ).toBeVisible();
    expect(screen.getByText(t("ending.close"))).toBeVisible();
  });
});

describe("AuthorityBuilder", () => {
  it("writes who decides, and says the WHO field also picks the voters", async () => {
    const user = userEvent.setup();
    const onWrite = vi.fn();
    renderWithLanguage(
      <AuthorityBuilder onWrite={onWrite} onSkip={() => {}} />,
    );

    expect(screen.getByText(t("authority.who_note"))).toBeVisible();
    await user.click(
      screen.getByRole("button", {
        name: t("authority.form.village_chooses.label"),
      }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.who.residents.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("authority.write") }),
    );

    expect(onWrite).toHaveBeenCalledWith({
      form: "village-chooses",
      who: { scope: "residents", group: undefined },
    });
  });

  it("can be declined, leaving the village with two people ruling", async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    renderWithLanguage(<AuthorityBuilder onWrite={() => {}} onSkip={onSkip} />);
    await user.click(screen.getByRole("button", { name: t("authority.skip") }));
    expect(onSkip).toHaveBeenCalledOnce();
  });
});

describe("ElectionResult", () => {
  it("shows which groups went which way, and never a count", () => {
    const state = setAuthority(initialState(5), {
      form: "village-chooses",
      who: { scope: "residents" },
    });
    renderWithLanguage(<ElectionResult election={state.election!} />);

    expect(screen.getByText(t("election.for"))).toBeVisible();
    expect(screen.getByText(t("election.won"))).toBeVisible();
    // The passers-through had no vote, and the screen says so rather than
    // leaving it to be inferred.
    expect(screen.getByText(/העוברים/)).toBeVisible();
  });
});

describe("KeyMoments", () => {
  it("replays the child's own moments, and admits the ones that never happened", () => {
    const state = resolve(initialState(6), {
      situation: ALL[0].situations[0],
      governedBy: null,
      appliedRuleIds: [],
      overrode: false,
      kind: "wrote-rule",
    });
    renderWithLanguage(
      <KeyMoments
        moments={keyMoments(state)}
        situationsById={BY_ID}
        onContinue={() => {}}
      />,
    );

    expect(screen.getByText(t("moments.legislative.name"))).toBeVisible();
    expect(
      screen.getByText(
        t("moments.legislative.what", { title: ALL[0].situations[0].title }),
      ),
    ).toBeVisible();
    // Judging and enforcing never happened in this game, and it says so.
    expect(screen.getAllByText(t("moments.never"))).toHaveLength(2);
  });
});

describe("SeparationBuilder", () => {
  it("staffs all three jobs before it will settle anything", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithLanguage(
      <SeparationBuilder
        actors={PEOPLE}
        showLostNote={false}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.queryByRole("button", { name: t("staffing.confirm") }),
    ).not.toBeInTheDocument();

    for (const job of ["legislative", "judicial", "executive"]) {
      const slot = screen.getByRole("group", {
        name: t(`staffing.${job}_legend`),
      });
      await user.click(
        within(slot).getByRole("button", { name: t("staffing.you") }),
      );
    }
    await user.click(
      screen.getByRole("button", { name: t("staffing.confirm") }),
    );

    expect(onConfirm).toHaveBeenCalledWith({
      legislative: { kind: "you" },
      judicial: { kind: "you" },
      executive: { kind: "you" },
    });
  });

  it("explains itself to a child who lost the election", () => {
    renderWithLanguage(
      <SeparationBuilder actors={PEOPLE} showLostNote onConfirm={() => {}} />,
    );
    expect(screen.getByText(t("staffing.lost_note"))).toBeVisible();
  });
});

describe("BookClosing", () => {
  it("reads the book, changes one rule, and asks for the last one", async () => {
    const user = userEvent.setup();
    const onReplace = vi.fn();
    const onClose = vi.fn();
    renderWithLanguage(
      <BookClosing rules={[RULE]} onReplace={onReplace} onClose={onClose} />,
    );

    expect(screen.getByText(ruleSentence(RULE, DEFAULT_LANG))).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: t("app.outcome.continue") }),
    );

    // One rule may be changed. Declining is a real answer.
    expect(screen.getByText(t("closing.change_heading"))).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: t("closing.change_skip") }),
    );
    expect(screen.getByText(/✓/)).toBeVisible();
    expect(onReplace).not.toHaveBeenCalled();

    // And then the amendment rule, written without knowing who'll need it.
    await user.click(
      screen.getByRole("button", { name: t("closing.amendment.cannot.label") }),
    );
    await user.click(screen.getByRole("button", { name: t("closing.seal") }));
    expect(onClose).toHaveBeenCalledWith("cannot");
  });

  it("goes straight to the last rule when the book is empty", async () => {
    const user = userEvent.setup();
    renderWithLanguage(
      <BookClosing rules={[]} onReplace={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText(t("closing.empty"))).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: t("app.outcome.continue") }),
    );
    expect(screen.getByText(t("closing.amendment_heading"))).toBeVisible();
  });
});

describe("AmendmentAttempt", () => {
  it("shows the rule and the promise the child made about changing rules", () => {
    renderWithLanguage(
      <AmendmentAttempt
        rule={RULE}
        amendment="two-agree"
        onAttempt={() => {}}
        onLeave={() => {}}
      />,
    );
    expect(screen.getByText(ruleSentence(RULE, DEFAULT_LANG))).toBeVisible();
    // Put in front of them before they try, not sprung afterwards.
    expect(
      screen.getByText(t("closing.amendment.two_agree.template")),
    ).toBeVisible();
  });

  it("lets the child walk away without trying", async () => {
    const user = userEvent.setup();
    const onLeave = vi.fn();
    renderWithLanguage(
      <AmendmentAttempt
        rule={RULE}
        amendment="author"
        onAttempt={() => {}}
        onLeave={onLeave}
      />,
    );
    await user.click(screen.getByRole("button", { name: t("amend.leave") }));
    expect(onLeave).toHaveBeenCalledOnce();
  });

  it("says there is nothing to change when the book is empty", () => {
    renderWithLanguage(
      <AmendmentAttempt
        rule={null}
        amendment="author"
        onAttempt={() => {}}
        onLeave={() => {}}
      />,
    );
    expect(screen.getByText(t("amend.empty_book"))).toBeVisible();
  });
});

describe("PrecedentChoice", () => {
  it("puts the two cases side by side and asks what decided it", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    const source = BY_ID["c2s3"];
    const situation = BY_ID["c2s4"];
    renderWithLanguage(
      <PrecedentChoice
        source={source}
        situation={situation}
        options={source.precedentOptions ?? situation.precedentOptions ?? []}
        onPick={onPick}
      />,
    );

    expect(screen.getByText(t("precedent.choice_intro"))).toBeVisible();
    expect(screen.getByText(t("precedent.choice_source_label"))).toBeVisible();
    expect(screen.getByText(source.title)).toBeVisible();

    const options = situation.precedentOptions ?? source.precedentOptions ?? [];
    if (options.length > 0) {
      await user.click(screen.getByRole("button", { name: options[0].label }));
      expect(onPick).toHaveBeenCalledWith(options[0].traits);
    }
  });
});
