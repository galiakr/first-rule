# Chapter 2 — "זה כבר קרה" (This Already Happened)

## Context

Chapter 1 ("אין כללים") is built and playable end-to-end: engine, content, full UI, 35 tests (see [chapter-1-plan.md](chapter-1-plan.md)). Design doc §9 describes Chapter 2 as the chapter where the **precedent mechanic** is born — similar cases recur, the child feels the pressure of consistency, and (§6.1) the game asks a one-time question the first time a precedent might apply: _"what was the thing that made you decide that way?"_ From then on, that precedent matches future cases by exact match on whichever traits the child named.

Chapter 1's engine has **zero precedent machinery** — `Rule`/`match.ts`/`conflict.ts` only know how to check a written rule's formal WHO/WHEN/subject scope against a situation. Precedents are a different, additional matching layer: they compare a _past ruling_ to a _new situation_ on five closed trait dimensions (act, justification, power, subject, actor) — dimensions `Situation` **already carries** (confirmed in chapter-1-plan.md: "already carries the five trait dimensions a later precedent system would need"). This doc covers that machinery, plus Chapter 2's four situations, plus the UI to play it, plus the chapter-1→chapter-2 transition that doesn't exist yet (the app currently hardcodes `CHAPTER_1` throughout and `ChapterEnd` has no continue action).

## Key design decisions

1. **Every resolved situation becomes a precedent candidate automatically.** `resolve()` already logs every resolution; it will also push a `Precedent` (traits copied from the situation, `essentialTraits: null` until asked about). No new "situation kind" (conflict vs. shared-problem) needs inventing — this reuses the existing resolve/log pipeline.

2. **A situation opts into checking a specific precedent via a new optional field `precedentOf: situationId`** (content-authored, not runtime similarity-scored). This keeps the "no thresholds, no language model" principle literal: the _engine_ only ever does exact trait-equality checks; _which past situation is worth comparing to_ is an editorial call, exactly like `victimId`/`actorId` already are.

3. **Rules still take priority over precedents.** `promptFor` checks field-collision and `applicableRules` first, unchanged. Precedent-checking only kicks in where a rule doesn't formally cover the case — which is also _why_ Chapter 2's precedent situations (c2s3, c2s4) use **subject `land`**, untouched by any rule anywhere in the game so far. This guarantees the precedent path is actually reachable regardless of what the child wrote in Chapter 1 (a `water` rule almost always exists by Chapter 2 and would otherwise shadow the precedent check).

4. **Three outcomes, matching §6.1 exactly, but modeled as two new `Prompt` kinds plus one contextual decoration, not three parallel kinds:**
   - `essentialTraits === null` → **`precedent-choice`**: show the two situations side by side, offer 2–3 single-trait options (phrased as full sentences, per §6.1's own caution), child taps one. Activates the precedent.
   - `essentialTraits` all match the new situation → **`precedent-reminder`**: "here's what you ruled last time" + apply/override (mirrors `rule-applies` exactly — reuses `outcomeFor`/`resolve` unchanged).
   - `essentialTraits` don't all match → **not a new terminal kind**. Falls through to the existing `write-rule`/`no-rule` prompt, decorated with an optional `precedentContext` (source situation + which traits differ) that the UI renders as a banner ("it's not exactly the same, but...") before the normal flow continues. This is deliberately the _cheap_ path — §6.1 calls this half "free," and modeling it as decoration instead of a new state avoids a whole parallel UI surface for what is essentially "no rule applies, but here's context."

   Single-trait-only options (not the full "one or two traits" range from §6.1) keep the tap interaction a single choice with no multi-select UI — still faithful, since an option like `{traits: ["act","subject"]}` phrased as one combined sentence covers the "two traits" case without needing multi-select.

5. **Content is built so the outcome genuinely depends on the child's own earlier choice** (not forced deterministic) — that's the actual lesson, not an implementation detail to smooth over. c2s3 offers two single-trait options against its precedent source (c1s2); c2s4 is designed so picking one option leads to `precedent-reminder` and the other leads to the `precedentContext`-decorated fallback. Both branches get real outcome text.

## Content — Chapter 2 situations

All four reuse existing actors (no new character needed). Subjects `things` and `confidence` are introduced fresh (not pinched this chapter — that's fine, pinch is a WHAT-clause invariant already fully satisfied by Chapter 1, not a per-subject one; noted as a forward-looking item in AGENTS.md, same as Chapter 1's own gaps list above).

| id   | subject    | act                   | justification    | power         | actor→victim | invitesRule | precedentOf                                 | notes                                                                                                                                                                                                               |
| ---- | ---------- | --------------------- | ---------------- | ------------- | ------------ | ----------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c2s1 | things     | took-without-asking   | meant-to-return  | victim-weaker | barak→michal | true        | —                                           | fresh case, invites a new rule about personal objects                                                                                                                                                               |
| c2s2 | confidence | told-what-was-private | everyone-does-it | equal         | dana→yotam   | true        | —                                           | fresh case, invites a new rule about private information                                                                                                                                                            |
| c2s3 | land       | blocked               | was-mine-first   | victim-weaker | yotam→michal | false       | c1s2                                        | first precedent check. Options offered (both true of c1s2 vs c2s3): "act" (both blocked something) / "power" (weaker victim both times)                                                                             |
| c2s4 | land       | blocked               | needed-more      | equal         | barak→yotam  | false       | c1s2 (same source as c2s3, not c2s3 itself) | shares `act` with the c1s2 precedent but not `power` (equal, not victim-weaker) → if the child picked "act" at c2s3: reminder. If they picked "power": falls through with precedent context, "not exactly the same" |

c2s3 and c2s4 deliberately both point at **c1s2**, not at each other — a precedent's `essentialTraits` is saved on the precedent itself (§6.1: "not as a global definition"), so chaining c2s4 off c2s3 would just open a second, independent choice question rather than testing what the child already decided. Pointing both at the same source is what makes c2s4's outcome actually depend on the c2s3 answer.

Chapter intro copy (`CHAPTER_2_TITLE`, `CHAPTER_2_INTRO`) frames the time-skip and the book already having entries in it, matching Chapter 1's intro tone.

## Data model — `src/engine/types.ts`

```ts
export type TraitKey = "act" | "justification" | "power" | "subject" | "actor";

export interface PrecedentOption {
  traits: TraitKey[]; // what gets saved as essentialTraits if picked
  label: string; // full-sentence token key, not a category name
}

export interface Precedent {
  id: string;
  situationId: string; // where this ruling was made
  governedBy: WhatClause | null;
  overrode: boolean;
  actorId: string;
  act: ActKind;
  justification: Justification;
  power: PowerBalance;
  subject: Subject;
  essentialTraits: TraitKey[] | null; // null until first compared
}
```

Add to `Situation`: `precedentOf?: string`, `precedentOptions?: PrecedentOption[]` (required in practice when `precedentOf` is set — enforced by a content test, not the type system, matching how `outcomes` completeness is already enforced by a test rather than a type).

Add to `GameState`: `precedents: Precedent[]`.

## Engine

**New file `src/engine/precedent.ts`** (pure, no React/I/O, same style as `match.ts`):

- `traitsMatch(precedent, situation, keys: TraitKey[]): boolean`
- `traitDifferences(precedent, situation): TraitKey[]` — all keys where values differ (used for the `precedentContext` banner)
- Exported `TRAIT_KEYS: TraitKey[]` (the closed list of 5, for iterating)

**`src/engine/match.ts`** — extend `Prompt` with `precedent-choice` and `precedent-reminder`, add optional `precedentContext` to `write-rule`/`no-rule`. `promptFor` gains a 4th param `situationsById: Record<string, Situation>` and, after the existing collision/rule-applies checks, adds the precedent branch described in decision #4 above.

**`src/engine/game.ts`**:

- `initialState` gains `precedents: []`
- `resolve()` also appends a new `Precedent` built from `resolution.situation`'s traits (mirrors how it already appends to `log`)
- new `activatePrecedent(state, precedentId, traits): GameState`
- new `advanceChapter(state): GameState` — `{ ...state, chapter: state.chapter + 1 }` (rules/log/rights/trust/precedents persist — this _is_ the point, per design doc §10)
- fixed the stale doc-comment on `cursor` (said "index into the chapter's situation list," actually a monotonic total — never reset today; behavior unchanged, comment corrected)

## Content

- New `src/content/chapter2.ts`, same shape as `chapter1.ts` (all copy via `t()`, following the language-tokens convention already established)
- New `src/content/situations.ts` exporting `SITUATIONS_BY_ID` (combines `CHAPTER_1` + `CHAPTER_2`) — the lookup `promptFor` needs for precedent source display, keeping `match.ts` itself free of content imports
- `src/content/tokens/tokens.csv` grows: `chapter2.*` (title/intro/4 situations × same field shape as chapter1.*), `trait.*` (5 short labels: act/justification/power/subject/actor — for the differences banner), `precedent.*` (choice intro, reminder intro/past-ruling line, raised/context banner copy, c2s3's two option labels). Regenerated `locales/*.json` via the existing `generate.py`.

## UI

- **`src/components/PrecedentChoice.tsx`** (new) — source situation summary vs. new situation summary, 2–3 tappable option buttons (mirrors `RuleBuilder`'s `Field` button styling)
- **`page.tsx`** "decide" phase: branches for `prompt.kind === "precedent-choice"` (renders `PrecedentChoice`, its picks call `activatePrecedent` then stay on "decide" — no `settle()`, since it doesn't resolve the situation, just informs the next prompt) and `"precedent-reminder"` (reuses the exact apply/override button pattern already used for `rule-applies`). The `precedentContext` banner is added to the existing `write-rule`/`no-rule` branches.
- **`RuleBook.tsx`**: precedents section (its own doc comment already said "shows rules and, later, precedents") — lists activated precedents (essentialTraits chosen) with their ruling, matching the existing empty/list pattern.
- **`ChapterEnd.tsx`**: genericized subtitle (`t("chapter_end.subtitle", {chapter: state.chapter})`); `onContinue`/`hasNextChapter` props — shows a "continue to chapter 2" action instead of the Chapter-1-specific closing note when there's a next chapter.
- **`page.tsx` top level**: hardcoded `CHAPTER_1` references replaced with a small `CHAPTERS` array (`[{title, intro, situations: CHAPTER_1}, {title, intro, situations: CHAPTER_2}]`), `chapterIndex` state alongside the existing `index`, `ChapterEnd`'s continue action calls `advanceChapter` + resets `index`/phase to the next chapter's intro.

## Testing

`src/engine/__tests__/engine.test.ts`, extended (same single-file convention Chapter 1 used):

- `traitsMatch` / `traitDifferences` unit tests
- `promptFor` returns `precedent-choice` the first time, `precedent-reminder` after activating with a fully-matching trait set, and a `write-rule`/`no-rule` with `precedentContext` when traits don't fully match
- `resolve()` appends a precedent with `essentialTraits: null`
- "chapter 2 content holds up": 4 situations, every situation has outcomes for all four WHAT clauses, `c2s3`/`c2s4` structural checks
- "playing chapter 2 through": both branches from decision #5 — picking "act" at c2s3 leads to a reminder at c2s4; picking "power" leads to the context-decorated fallback

## Verification

1. `npx tsc --noEmit`, `npm run lint`, `npm test` (all existing 35 + new precedent/chapter2 tests green)
2. `npm run build`
3. Manual run-through via `npm run dev`: play Chapter 1 end to end, confirm `ChapterEnd` now offers "continue," play into Chapter 2, deliberately pick each precedent option at c2s3 across two separate playthroughs to see both the `reminder` and the context-decorated fallback at c2s4, open the rule book mid-Chapter-2 to confirm precedents show up
4. Grep the rendered HTML for raw token keys (same check used after the language-tokens migration) to catch anything unresolved
