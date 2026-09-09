"use client";

import { useMemo, useState } from "react";

import AboutVillage from "@/components/AboutVillage";
import ChapterEnd from "@/components/ChapterEnd";
import RuleBook from "@/components/RuleBook";
import RuleBuilder from "@/components/RuleBuilder";
import TableOfContents from "@/components/TableOfContents";
import {
  CHAPTER_1,
  CHAPTER_1_INTRO,
  CHAPTER_1_TITLE,
} from "@/content/chapter1";
import { ACTORS } from "@/content/village";
import {
  addRule,
  initialState,
  outcomeFor,
  promptFor,
  resolve,
} from "@/engine/game";
import { ruleSentence } from "@/engine/match";
import { GROUP_LABEL } from "@/engine/options";
import { trustLevel } from "@/engine/rights";
import type { GameState, Rule, WhatClause } from "@/engine/types";

type Phase =
  "about" | "intro" | "scene" | "decide" | "outcome" | "lesson" | "end";

interface Pending {
  governedBy: WhatClause | null;
  appliedRuleIds: string[];
  overrode: boolean;
}

/** How a group shows up, given how much it trusts you. Never a number (§7). */
function opener(state: GameState, group: keyof GameState["trust"]): string {
  const name = GROUP_LABEL[group];
  switch (trustLevel(state.trust[group])) {
    case "comes-to-you":
      return `${name} באו אליך ראשונים, וסיפרו הכול.`;
    case "comes-but":
      return `${name} התלבטו לפני שבאו, וסיפרו רק חלק.`;
    case "stops-coming":
      return `${name} לא באו לספר לך. שמעת על זה אחר כך, ממישהו אחר.`;
  }
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

export default function Page() {
  const [state, setState] = useState<GameState>(initialState);
  const [phase, setPhase] = useState<Phase>("about");
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  const situation = CHAPTER_1[index];
  const readCount = phase === "about" || phase === "intro" ? 0 : index + 1;
  const prompt = useMemo(
    () => (situation ? promptFor(state, situation, ACTORS) : null),
    [state, situation],
  );

  function settle(next: Pending) {
    setPending(next);
    setPhase("outcome");
  }

  function commit() {
    if (!pending || !situation) return;
    setState((s) => resolve(s, { situation, ...pending }));
    setPending(null);
    if (index + 1 >= CHAPTER_1.length) {
      setPhase("end");
    } else {
      setIndex(index + 1);
      setPhase("scene");
    }
  }

  function write(rule: Rule) {
    setState((s) => addRule(s, rule));
    settle({
      governedBy: rule.what,
      appliedRuleIds: [rule.id],
      overrode: false,
    });
  }

  return (
    <main className="lamplight min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-read space-y-8">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <p className="font-book text-lg text-lamp">כלל ראשון</p>
            {situation &&
            (phase === "scene" ||
              phase === "decide" ||
              phase === "outcome" ||
              phase === "lesson") ? (
              <p className="text-sm text-quiet">
                פרק {state.chapter} · מצב {index + 1} מתוך {CHAPTER_1.length}
              </p>
            ) : null}
          </div>
          <div className="flex items-baseline gap-4">
            <button
              type="button"
              onClick={() => setTocOpen(true)}
              className="text-sm text-quiet underline underline-offset-4 hover:text-paper"
            >
              תוכן העניינים
            </button>
            <button
              type="button"
              onClick={() => setBookOpen(true)}
              className="text-sm text-quiet underline underline-offset-4 hover:text-paper"
            >
              ספר הכללים
              {state.rules.length > 0 ? ` (${state.rules.length})` : ""}
            </button>
          </div>
        </div>

        {phase === "about" ? (
          <AboutVillage onContinue={() => setPhase("intro")} />
        ) : null}

        {phase === "intro" ? (
          <section className="space-y-6">
            <h1 className="font-book text-4xl leading-tight">
              {CHAPTER_1_TITLE}
            </h1>
            <p className="text-lg leading-relaxed">{CHAPTER_1_INTRO}</p>
            <Action onClick={() => setPhase("scene")}>להתחיל</Action>
          </section>
        ) : null}

        {phase === "scene" && situation ? (
          <section className="settle space-y-6">
            <p className="text-sm text-quiet">
              {opener(state, situation.speakerGroup)}
            </p>
            <h2 className="font-book text-2xl">{situation.title}</h2>
            <p className="text-lg leading-relaxed">{situation.text}</p>
            <Action onClick={() => setPhase("decide")}>אז מה עושים</Action>
          </section>
        ) : null}

        {phase === "decide" && situation && prompt ? (
          <section className="settle space-y-6">
            {prompt.kind === "write-rule" ? (
              <>
                <p className="text-lg leading-relaxed">
                  אין שום כלל שנוגע בזה. אתה יכול לכתוב אחד עכשיו — והוא יישאר
                  בספר.
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
                  יש כלל בספר שחל על זה. אתה כתבת אותו.
                </p>
                <div className="rounded-sm bg-paper p-5 font-book text-[1.15rem] leading-relaxed text-ink">
                  {ruleSentence(prompt.rules[0])}
                </div>
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
                    להפעיל את הכלל
                  </Action>
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
                    להחליט אחרת הפעם
                  </Action>
                </div>
              </>
            ) : null}

            {prompt.kind === "collision" ? (
              <>
                <p className="text-lg leading-relaxed">
                  שני כללים שכתבת חלים כאן, והם אומרים דברים הפוכים.
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
                      className="block w-full rounded-sm bg-paper p-5 text-right font-book text-[1.1rem] leading-relaxed text-ink hover:bg-white"
                    >
                      {ruleSentence(rule)}
                    </button>
                  ))}
                </div>
                {prompt.firstTime ? (
                  <p className="border-r-2 border-lamp ps-1 pe-4 text-quiet">
                    לפעמים רואים מראש שכלל חדש מתנגש בישן. לפעמים מגלים רק כשזה
                    כבר קרה למישהו.
                  </p>
                ) : null}
              </>
            ) : null}

            {prompt.kind === "no-rule" ? (
              <>
                <p className="text-lg leading-relaxed">
                  אין בספר שום כלל שנוגע בזה. אף אחד לא כתב אחד בזמנו.
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
                  להמשיך
                </Action>
              </>
            ) : null}
          </section>
        ) : null}

        {phase === "outcome" && situation && pending ? (
          <section className="settle space-y-6">
            <p className="text-lg leading-relaxed">
              {outcomeFor(situation, pending.governedBy, pending.overrode).text}
            </p>
            <Action onClick={() => setPhase("lesson")}>ואז</Action>
          </section>
        ) : null}

        {phase === "lesson" && situation ? (
          <section className="settle space-y-6">
            <p className="border-r-2 border-lamp pe-4 ps-1 text-lg leading-relaxed">
              {situation.lesson}
            </p>
            <Action onClick={commit}>
              {index + 1 >= CHAPTER_1.length ? "לסגור את הפרק" : "הלאה"}
            </Action>
          </section>
        ) : null}

        {phase === "end" ? <ChapterEnd state={state} /> : null}
      </div>

      <RuleBook
        rules={state.rules}
        open={bookOpen}
        onClose={() => setBookOpen(false)}
      />

      <TableOfContents
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        readCount={readCount}
      />
    </main>
  );
}
