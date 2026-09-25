"use client";

import { useState } from "react";

import AboutVillage from "@/components/AboutVillage";
import AuthorityBuilder from "@/components/AuthorityBuilder";
import BookClosing from "@/components/BookClosing";
import ElectionResult from "@/components/ElectionResult";
import ChapterEnd from "@/components/ChapterEnd";
import LinkedText from "@/components/LinkedText";
import Notes from "@/components/Notes";
import PrecedentChoice from "@/components/PrecedentChoice";
import RuleBook from "@/components/RuleBook";
import RuleBuilder from "@/components/RuleBuilder";
import TableOfContents from "@/components/TableOfContents";
import type { ChapterEntry } from "@/components/TableOfContents";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage, useT } from "@/content/language";
import type { Lang, Translate } from "@/content/tokens";
import { chapterNotes } from "@/content/notes";
import { chapters, situationsById } from "@/content/situations";
import { actorsWithChild } from "@/content/village";
import {
  activatePrecedent,
  addRule,
  advanceChapter,
  initialState,
  outcomeFor,
  promptFor,
  replaceRule,
  resolutionKind,
  resolve,
  saysOverrideNote,
} from "@/engine/game";
import {
  canOverride,
  closeBook,
  setAuthority,
  variantKeys,
} from "@/engine/authority";
import type { Prompt } from "@/engine/game";
import { ruleSentence } from "@/engine/match";
import { authoritySentence } from "@/engine/options";
import { findOption, groupLabel, whatOptions } from "@/engine/options";
import { trustLevel } from "@/engine/rights";
import type {
  AmendmentForm,
  AuthorityRule,
  GameState,
  ResolutionKind,
  Rule,
  TraitKey,
  WhatClause,
} from "@/engine/types";

// "about"/"intro"/"end" are still their own screens. Everything about one
// situation — scene, decide, outcome, lesson — lives on a single "situation"
// screen, appended section by section as each step completes, so the event
// stays in front of the child the whole time they're deciding what to do
// about it (never hidden behind a phase switch).
// "closing" is the book-closing ceremony at the end of chapter 5 (§10): it
// sits between the last situation and the chapter-end screen, because from
// then on nothing may be written into the book again.
type Phase = "about" | "intro" | "situation" | "closing" | "end";

interface Pending {
  governedBy: WhatClause | null;
  appliedRuleIds: string[];
  overrode: boolean;
  /** Chapter 5's situations branch on the authority rule, not the WHAT clause. */
  variants?: string[];
  /** Which of the three jobs this was — chapter 6 replays these by name. */
  kind: ResolutionKind;
}

/** What `settle` is given; the kind is derived from the prompt on screen. */
type Decision = Omit<Pending, "kind"> & { wrote?: boolean };

/** How a group shows up, given how much it trusts you. Never a number (§7). */
function opener(
  state: GameState,
  group: keyof GameState["trust"],
  lang: Lang,
  t: Translate,
): string {
  const vars = { group: groupLabel(lang)[group] };
  switch (trustLevel(state.trust[group])) {
    case "comes-to-you":
      return t("app.opener.comes_to_you", vars);
    case "comes-but":
      return t("app.opener.comes_but", vars);
    case "stops-coming":
      return t("app.opener.stops_coming", vars);
  }
}

/** Recap line for a precedent's past ruling — null governedBy means no rule fired. */
function pastRuling(
  governedBy: WhatClause | null,
  lang: Lang,
  t: Translate,
): string {
  if (governedBy === null) return t("precedent.past_ruling_none");
  return t("precedent.past_ruling", {
    ruling: findOption(whatOptions(lang), governedBy).label,
  });
}

function Action({
  children,
  onClick,
  tone = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "primary" | "quiet";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        tone === "primary"
          ? "rounded-sm bg-lamp px-5 py-2.5 text-night"
          : "rounded-sm border border-moss px-5 py-2.5 text-paper hover:bg-dusk"
      }
    >
      {children}
    </button>
  );
}

/** A short "this is already decided" line, once a step is no longer live. */
function Confirmed({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-lamp">✓ {children}</p>;
}

/** The banner shown atop write-rule/no-rule when a precedent partially matches. */
function PrecedentContextBanner({ differences }: { differences: TraitKey[] }) {
  const t = useT();

  return (
    <div className="settle rounded-sm border-s-2 border-lamp bg-dusk p-4">
      <p className="text-[0.95rem]">{t("precedent.raised_intro")}</p>
      <p className="mt-2 text-sm text-quiet">
        {t("precedent.differences_heading")}{" "}
        {differences.map((key) => t(`trait.${key}`)).join(", ")}
      </p>
    </div>
  );
}

export default function Page() {
  const { lang, t } = useLanguage();
  const [state, setState] = useState<GameState>(initialState);
  const [villageName, setVillageName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("about");
  const [chapterIndex, setChapterIndex] = useState(0);
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [decidedPrompt, setDecidedPrompt] = useState<Prompt | null>(null);
  const [lessonRevealed, setLessonRevealed] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  // Content is rebuilt for whichever language is active; nothing above this
  // line depends on it, so switching mid-chapter keeps rules, precedents and
  // position exactly where they were.
  const allChapters = chapters(lang);
  const currentChapter = allChapters[chapterIndex];
  const hasNextChapter = chapterIndex + 1 < allChapters.length;
  const situation = currentChapter.situations[index];
  const prompt = situation
    ? promptFor(state, situation, actorsWithChild(lang), situationsById(lang))
    : null;

  const chapterEntries: ChapterEntry[] = allChapters.map((c, i) => ({
    title: c.title,
    intro: c.intro,
    situations: c.situations,
    readCount:
      i < chapterIndex
        ? c.situations.length
        : i > chapterIndex
          ? 0
          : phase === "about" || phase === "intro"
            ? 0
            : index + 1,
  }));

  // A chapter's note is earned by *finishing* the chapter, not by reaching
  // it: the concept is named only once it's been felt (§2). The chapter the
  // child is inside counts only at its end screen.
  const unlockedNoteChapters = allChapters
    .map((_, i) => i + 1)
    .filter(
      (n) =>
        n - 1 < chapterIndex || (n - 1 === chapterIndex && phase === "end"),
    );

  /** Locks in a decision — the live decide UI freezes into a recap, and the
   * outcome section appears below it. Captures `prompt` from this render's
   * closure, so the recap always matches what was actually on screen when
   * the child acted. */
  function settle(next: Decision) {
    if (!prompt) return;
    const { wrote = false, ...rest } = next;
    setDecidedPrompt(prompt);
    setPending({
      variants: variantKeys(state),
      ...rest,
      kind: resolutionKind(prompt.kind, { overrode: rest.overrode, wrote }),
    });
  }

  function commit() {
    if (!pending || !situation) return;
    setState((s) => resolve(s, { situation, ...pending }));
    setPending(null);
    setDecidedPrompt(null);
    setLessonRevealed(false);
    if (index + 1 >= currentChapter.situations.length) {
      // The book closes at the end of chapter 5 (§10), before the rights
      // board is read out.
      setPhase(state.chapter === 5 && !state.bookClosed ? "closing" : "end");
    } else {
      setIndex(index + 1);
    }
  }

  function writeAuthority(authority: AuthorityRule) {
    // The election, if there is one, runs off the trust the child has
    // already earned — so it has to be computed from the state as it stands
    // before this situation resolves.
    const next = setAuthority(state, authority);
    setState(next);
    setDecidedPrompt(prompt);
    setPending({
      governedBy: null,
      appliedRuleIds: [],
      overrode: false,
      variants: variantKeys(next),
      kind: "wrote-authority",
    });
  }

  function write(rule: Rule) {
    setState((s) => addRule(s, rule));
    settle({
      governedBy: rule.what,
      appliedRuleIds: [rule.id],
      overrode: false,
      wrote: true,
    });
  }

  function continueToNextChapter() {
    setState((s) => advanceChapter(s));
    setChapterIndex((i) => i + 1);
    setIndex(0);
    setPhase("intro");
  }

  return (
    <main className="lamplight min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-read space-y-8">
        <div className="flex flex-wrap items-baseline justify-between gap-y-2">
          <div className="flex items-baseline gap-3">
            <p className="font-book text-lg text-lamp">{t("app.title")}</p>
            {villageName ? (
              <p className="text-sm text-quiet">{villageName}</p>
            ) : null}
            {situation && phase === "situation" ? (
              <p className="text-sm text-quiet">
                {t("app.chapter_progress", {
                  chapter: state.chapter,
                  n: index + 1,
                  total: currentChapter.situations.length,
                })}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-baseline gap-4">
            <button
              type="button"
              onClick={() => setTocOpen(true)}
              className="text-sm text-quiet underline underline-offset-4 hover:text-paper"
            >
              {t("app.toc_button")}
            </button>
            <button
              type="button"
              onClick={() => setBookOpen(true)}
              className="text-sm text-quiet underline underline-offset-4 hover:text-paper"
            >
              {t("app.rulebook_button")}
              {state.rules.length > 0 ? ` (${state.rules.length})` : ""}
            </button>
            <button
              type="button"
              onClick={() => setNotesOpen(true)}
              className="text-sm text-quiet underline underline-offset-4 hover:text-paper"
            >
              {t("app.notes_button")}
              {unlockedNoteChapters.length > 0
                ? ` (${unlockedNoteChapters.length})`
                : ""}
            </button>
            <LanguageSwitcher />
          </div>
        </div>

        {phase === "about" ? (
          <AboutVillage
            onContinue={(name) => {
              setVillageName(name);
              setPhase("intro");
            }}
          />
        ) : null}

        {phase === "intro" ? (
          <section className="space-y-6">
            <h1 className="font-book text-4xl leading-tight">
              {currentChapter.title}
            </h1>
            <p className="text-lg leading-relaxed">{currentChapter.intro}</p>
            <Action onClick={() => setPhase("situation")}>
              {t("app.intro_continue")}
            </Action>
          </section>
        ) : null}

        {phase === "situation" && situation ? (
          <section className="settle space-y-6">
            {/* Scene — always visible while this situation is open. */}
            <p className="text-sm text-quiet">
              {opener(state, situation.speakerGroup, lang, t)}
            </p>
            <h2 className="font-book text-2xl">{situation.title}</h2>
            <p className="text-lg leading-relaxed">
              <LinkedText text={situation.text} />
            </p>

            {/* Decide — live and interactive until a choice is made, then
                freezes into a static recap so the outcome can appear below
                it without the buttons staying clickable. */}
            {pending === null && prompt ? (
              <div className="settle space-y-6">
                {prompt.kind === "precedent-choice" ? (
                  <PrecedentChoice
                    source={prompt.source}
                    situation={situation}
                    options={situation.precedentOptions ?? []}
                    onPick={(traits) =>
                      setState((s) =>
                        activatePrecedent(s, prompt.precedent.id, traits),
                      )
                    }
                  />
                ) : null}

                {prompt.kind === "precedent-reminder" ? (
                  <>
                    <p className="text-lg leading-relaxed">
                      {t("precedent.reminder_intro")}
                    </p>
                    <div className="rounded-sm bg-paper p-5 font-book text-[1.15rem] leading-relaxed text-ink">
                      {pastRuling(prompt.precedent.governedBy, lang, t)}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Action
                        onClick={() =>
                          settle({
                            governedBy: prompt.precedent.governedBy,
                            appliedRuleIds: [],
                            overrode: false,
                          })
                        }
                      >
                        {t("precedent.apply")}
                      </Action>
                      <Action
                        tone="quiet"
                        onClick={() =>
                          settle({
                            governedBy: prompt.precedent.governedBy,
                            appliedRuleIds: [],
                            overrode: true,
                          })
                        }
                      >
                        {t("app.decide.override_rule")}
                      </Action>
                    </div>
                  </>
                ) : null}

                {prompt.kind === "write-authority" ? (
                  <AuthorityBuilder
                    onWrite={writeAuthority}
                    onSkip={() =>
                      settle({
                        governedBy: null,
                        appliedRuleIds: [],
                        overrode: false,
                      })
                    }
                  />
                ) : null}

                {prompt.kind === "write-rule" ? (
                  <>
                    {prompt.precedentContext ? (
                      <PrecedentContextBanner
                        differences={prompt.precedentContext.differences}
                      />
                    ) : null}
                    <p className="text-lg leading-relaxed">
                      {t("app.decide.write_rule_intro")}
                    </p>
                    <RuleBuilder
                      subject={situation.subject}
                      situationId={situation.id}
                      existingRules={state.rules}
                      onWrite={write}
                      onSkip={() =>
                        settle({
                          governedBy: null,
                          appliedRuleIds: [],
                          overrode: false,
                        })
                      }
                    />
                  </>
                ) : null}

                {prompt.kind === "rule-applies" ? (
                  <>
                    <p className="text-lg leading-relaxed">
                      {canOverride(state)
                        ? t("app.decide.rule_applies_intro")
                        : t("app.decide.other_decides_intro")}
                    </p>
                    <div className="rounded-sm bg-paper p-5 font-book text-[1.15rem] leading-relaxed text-ink">
                      {ruleSentence(prompt.rules[0], lang)}
                    </div>
                    {/* Once the child lost the role, the rule is applied to
                        them word for word and there is nothing to choose —
                        §9.5's whole point about losing being real. */}
                    <div className="flex flex-wrap gap-3">
                      <Action
                        onClick={() =>
                          settle({
                            governedBy: prompt.rules[0].what,
                            appliedRuleIds: prompt.rules.map((r) => r.id),
                            overrode: false,
                          })
                        }
                      >
                        {canOverride(state)
                          ? t("app.decide.apply_rule")
                          : t("app.decide.watch")}
                      </Action>
                      {canOverride(state) ? (
                        <Action
                          tone="quiet"
                          onClick={() =>
                            settle({
                              governedBy: prompt.rules[0].what,
                              appliedRuleIds: prompt.rules.map((r) => r.id),
                              overrode: true,
                            })
                          }
                        >
                          {t("app.decide.override_rule")}
                        </Action>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {prompt.kind === "collision" ? (
                  <>
                    <p className="text-lg leading-relaxed">
                      {t("app.decide.collision_intro")}
                    </p>
                    <div className="space-y-3">
                      {prompt.rules.map((rule) => (
                        <button
                          key={rule.id}
                          type="button"
                          onClick={() =>
                            settle({
                              governedBy: rule.what,
                              appliedRuleIds: prompt.rules.map((r) => r.id),
                              overrode: false,
                            })
                          }
                          className="block w-full rounded-sm bg-paper p-5 text-start font-book text-[1.1rem] leading-relaxed text-ink hover:bg-white"
                        >
                          {ruleSentence(rule, lang)}
                        </button>
                      ))}
                    </div>
                    {prompt.firstTime ? (
                      <p className="border-s-2 border-lamp ps-1 pe-4 text-quiet">
                        {t("app.decide.collision_first_time_note")}
                      </p>
                    ) : null}
                  </>
                ) : null}

                {prompt.kind === "no-rule" ? (
                  <>
                    {prompt.precedentContext ? (
                      <PrecedentContextBanner
                        differences={prompt.precedentContext.differences}
                      />
                    ) : null}
                    <p className="text-lg leading-relaxed">
                      {t("app.decide.no_rule_intro")}
                    </p>
                    <Action
                      onClick={() =>
                        settle({
                          governedBy: null,
                          appliedRuleIds: [],
                          overrode: false,
                        })
                      }
                    >
                      {t("app.decide.continue")}
                    </Action>
                  </>
                ) : null}
              </div>
            ) : null}

            {pending !== null && decidedPrompt ? (
              <div className="settle space-y-4">
                {decidedPrompt.kind === "precedent-reminder" ? (
                  <>
                    <div className="rounded-sm bg-paper p-5 font-book text-[1.15rem] leading-relaxed text-ink">
                      {pastRuling(decidedPrompt.precedent.governedBy, lang, t)}
                    </div>
                    <Confirmed>
                      {pending.overrode
                        ? t("app.decide.override_rule")
                        : t("precedent.apply")}
                    </Confirmed>
                  </>
                ) : null}

                {decidedPrompt.kind === "write-authority" ? (
                  state.authority ? (
                    <>
                      <div className="rounded-sm bg-paper p-5 font-book text-[1.15rem] leading-relaxed text-ink">
                        {authoritySentence(state.authority, lang)}
                      </div>
                      <Confirmed>{t("authority.write")}</Confirmed>
                      {state.election ? (
                        <ElectionResult election={state.election} />
                      ) : null}
                    </>
                  ) : (
                    <Confirmed>{t("authority.skip")}</Confirmed>
                  )
                ) : null}

                {decidedPrompt.kind === "write-rule" ? (
                  <>
                    {decidedPrompt.precedentContext ? (
                      <PrecedentContextBanner
                        differences={decidedPrompt.precedentContext.differences}
                      />
                    ) : null}
                    {pending.appliedRuleIds.length > 0 ? (
                      <>
                        <div className="rounded-sm bg-paper p-5 font-book text-[1.15rem] leading-relaxed text-ink">
                          {ruleSentence(
                            state.rules.find(
                              (r) => r.id === pending.appliedRuleIds[0],
                            )!,
                            lang,
                          )}
                        </div>
                        <Confirmed>{t("builder.write")}</Confirmed>
                      </>
                    ) : (
                      <Confirmed>{t("builder.skip")}</Confirmed>
                    )}
                  </>
                ) : null}

                {decidedPrompt.kind === "rule-applies" ? (
                  <>
                    <div className="rounded-sm bg-paper p-5 font-book text-[1.15rem] leading-relaxed text-ink">
                      {ruleSentence(decidedPrompt.rules[0], lang)}
                    </div>
                    <Confirmed>
                      {pending.overrode
                        ? t("app.decide.override_rule")
                        : t("app.decide.apply_rule")}
                    </Confirmed>
                  </>
                ) : null}

                {decidedPrompt.kind === "collision" ? (
                  <div className="rounded-sm bg-paper p-5 font-book text-[1.1rem] leading-relaxed text-ink">
                    {ruleSentence(
                      decidedPrompt.rules.find(
                        (r) => r.what === pending.governedBy,
                      ) ?? decidedPrompt.rules[0],
                      lang,
                    )}
                  </div>
                ) : null}

                {decidedPrompt.kind === "no-rule" ? (
                  <>
                    {decidedPrompt.precedentContext ? (
                      <PrecedentContextBanner
                        differences={decidedPrompt.precedentContext.differences}
                      />
                    ) : null}
                    <Confirmed>{t("app.decide.continue")}</Confirmed>
                  </>
                ) : null}
              </div>
            ) : null}

            {/* Outcome — appears once the decision above is locked in. */}
            {pending !== null ? (
              <div className="settle space-y-6 border-t border-moss pt-6">
                <p className="text-lg leading-relaxed">
                  <LinkedText
                    text={
                      outcomeFor(
                        situation,
                        pending.governedBy,
                        pending.overrode,
                        pending.variants,
                      ).text
                    }
                  />
                </p>
                {saysOverrideNote(state, pending.overrode) ? (
                  <p className="border-s-2 border-harm pe-4 ps-3 text-lg leading-relaxed">
                    {t("app.override_note")}
                  </p>
                ) : null}
                {!lessonRevealed ? (
                  <Action onClick={() => setLessonRevealed(true)}>
                    {t("app.outcome.continue")}
                  </Action>
                ) : null}
              </div>
            ) : null}

            {/* Lesson — appears once the outcome above has been read. */}
            {lessonRevealed ? (
              <div className="settle space-y-6 border-t border-moss pt-6">
                <p className="border-s-2 border-lamp pe-4 ps-1 text-lg leading-relaxed">
                  <LinkedText text={situation.lesson} />
                </p>
                <Action onClick={commit}>
                  {index + 1 >= currentChapter.situations.length
                    ? t("app.lesson.close_chapter")
                    : t("app.lesson.next")}
                </Action>
              </div>
            ) : null}
          </section>
        ) : null}

        {phase === "closing" ? (
          <BookClosing
            rules={state.rules}
            onReplace={(ruleId, next) =>
              setState((s) => replaceRule(s, ruleId, next))
            }
            onClose={(amendment: AmendmentForm) => {
              setState((s) => closeBook(s, amendment));
              setPhase("end");
            }}
          />
        ) : null}

        {phase === "end" ? (
          <ChapterEnd
            state={state}
            epilogue={currentChapter.epilogue}
            onContinue={hasNextChapter ? continueToNextChapter : undefined}
          />
        ) : null}
      </div>

      <RuleBook
        state={state}
        rules={state.rules}
        precedents={state.precedents}
        situationsById={situationsById(lang)}
        open={bookOpen}
        onClose={() => setBookOpen(false)}
      />

      <TableOfContents
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        chapters={chapterEntries}
      />

      <Notes
        notes={chapterNotes(lang)}
        titles={allChapters.map((c) => c.title)}
        unlocked={unlockedNoteChapters}
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
      />
    </main>
  );
}
