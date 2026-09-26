# כלל ראשון · First Rule

> This file is the most important file for AI-assisted development. It gives Claude, Copilot, and Cursor the context they need to help you without constant re-explanation. Keep it updated as the project evolves.

---

## What this project is

A civics/democracy game for kids 8–12: a child arrives in a village with no rules, writes the rules themselves over the course of the game, and then lives under them. Hebrew (RTL) and English (LTR), switchable in place at any time, single player, no backend. Full design is in `docs/design.md` — read it before touching game logic or content, it is the source of truth for _why_ the engine works the way it does. **All seven chapters are built.** The game is playable start to finish, in Hebrew and English.

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack) + React 19.2 + TypeScript + Tailwind CSS 4
- **Backend:** none — no API routes, no database, everything runs client-side with in-memory state
- **Deploy:** not yet set up

## Project structure

```
src/
  engine/          the whole game as pure functions — no React, no I/O
    types.ts       core data model
    options.ts     the rule builder — 4 fields × 4 options, closed at 16
    match.ts       whether a rule applies to a situation + rule-sentence assembly
    conflict.ts    textual contradiction vs. field collision
    precedent.ts   does a past ruling apply to a new situation (trait matching)
    authority.ts   who decides (§9.5): the election, losing it, closing the book
    separation.ts  the three jobs (§9.6): the replay, staffing, revoking
    amendment.ts   changing a written rule (§9.7), and replaceRule
    rights.ts      the rights board and trust
    game.ts        the reducer: what's asked, what happens, what's saved, chapter transitions
  content/         the village, chapters 1–7 — data only (chapter1.ts … chapter7.ts, village.ts)
    notes.ts       one concept note per chapter for the notebook (unlocked only after a chapter ends)
    language.tsx   LanguageProvider + useLang/useT — the current language, and <html lang/dir>
    situations.ts  every situation keyed by id, for precedent source lookup
    tokens/        language tokens: tokens.csv (source), generate.py, locales/*.json (generated), t()
  components/      rule builder, rule book, notebook, table of contents, chapter end, about screen, precedent choice, language switcher
  app/             single-screen state machine driving the whole game across chapters (src/app/page.tsx)
```

The engine is intentionally React-free and I/O-free — a whole chapter can be played through in a test without rendering anything (see `src/engine/__tests__/engine.test.ts`).

---

## Coding conventions

- Functional React components only — no class components
- TypeScript strict mode — no `any`
- Components use one default export per file (Next.js/React convention already in use here — not the toolkit-default "named exports only" rule)
- Styling via Tailwind utility classes against the custom palette in `tailwind.config.ts` (`night`, `paper`, `lamp`, `moss`, `quiet`, `ink`, `harm`, `dusk`) — no inline styles
- **No user-facing string is ever written in a component.** Everything goes through a token: `useT()` in components, `translator(lang)` inside a content/option factory. Every string faces the child, never the parent.
- **Anything built from tokens is a function of the language**, wrapped in `perLanguage(...)` so each language is built once and keeps a stable identity. Never a module-level `const` built from `t()` — that freezes one language at import time and the switcher can't move it.
- Layout must use logical properties, not physical ones: `text-start`/`ms-`/`ps-`/`border-s-` rather than `text-right`/`mr-`/`pr-`/`border-r-`. `dir` flips per language, and physical classes then point the wrong way.
- Component files: `PascalCase.tsx`. Engine files: `camelCase.ts`. Test files: `*.test.ts`
- Default to no comments. Only add one when the _why_ is genuinely non-obvious (a design-doc constraint, a subtle invariant) — the existing engine files' file-header comments are the model to follow, not inline narration

## Game-design invariants (do not relax without reading `docs/design.md`)

These are enforced by `src/engine/__tests__/engine.test.ts` — a failing test here usually means the change violates a deliberate design constraint, not a bug in the test:

- **The rule builder is closed at 16** (4 fields × 4 options). Do not add a 5th option to any field without a situation in the content that specifically exercises it (§6 "the pinch").
- **The pinch rule (§7):** every rule the child can write must have at least one future situation where applying it costs the child, a character they like, or the weakest group.
- **Rights are states, not points** — `intact` / `strained` / `broken`, always attached to a named group. A strain never quietly heals a break.
- **Trust is never shown as a number** — it only surfaces through which of three ways a group approaches the child (`comes-to-you` / `comes-but` / `stops-coming`).
- **The rule book is open the whole game**; the rights board is only revealed at the end of a chapter (§10) — don't leak rights state into the always-visible book.
- **The notebook names a concept only after its chapter is finished** (§2: felt first, named afterwards). `src/content/notes.ts` holds one note per chapter, and it is the only place in the game that uses adult vocabulary ("תקדים" — precedent, "שלטון החוק" — the rule of law) — never put those words into playable chapter content.
- **Never run a blanket regex over the copy.** A contraction pass across the English column turned "when keeping it is inconvenient" into "when keeping it's inconvenient" in two places — "it" was an object, not a subject. Prose edits need reading, not matching.
- **A situation's subject is inherited, never chosen** — this is what makes rules land narrower than the child expects, on purpose. `replaceRule` enforces it: rewriting a rule may change its four clauses and nothing else, not its subject and not where it came from.
- **Every resolution records which of the three jobs it was** (`LogEntry.kind`, via `resolutionKind`). Chapter 6 replays these moments back to the child by name, so a mislabelled one puts the wrong word on something they did. `resolve()` requires it deliberately — a new call site has to say what kind of moment it is rather than defaulting to a wrong one.
- **The book is closed after chapter 5** (§10). `canWriteRules()` collapses any later write-rule prompt to no-rule; don't work around it.
- **The amendment rule is written behind a veil** (§10) — the child writes it in chapter 5 without knowing chapter 7 will make them want to change something. Nothing in `BookClosing` may hint at that; the veil is the point.
- **`passers-through` never speaks** (§4: "אין להם קול בכלל" — they have no voice at all). No situation may set `speakerGroup: "passers-through"` — someone else always reports what a passer-through did or had done to them. Their trust still moves; it matters for Chapter 5's election. Pinned by a content test.

## What to avoid

- Do not mutate props or state directly
- Do not use `useEffect` for data that can be derived
- Do not skip accessibility attributes (`alt`, `aria-label`, `role`) — this is a kids' product, keyboard and screen-reader support matter
- Do not commit `.env`, credentials, or secrets
- Do not add `any` to TypeScript to silence errors
- Do not add a runtime language model, multiplayer, voice narration, or a free-text rule editor — explicitly out of scope for this version (design doc §11)

## Security basics

- No LLM is exposed to end users in this app (it's a static, offline-logic game) — `ai/guardrails.md`-style runtime prompt-injection protection does not apply here
- All secrets via environment variables if any are ever introduced — document them in `.env.example` at that point (none exist today, so no `.env.example` file yet)
- Never log sensitive data — not currently applicable (no logging, no analytics, no accounts)

## Git hygiene

- One logical change per commit
- PR descriptions explain _why_, not just _what_
- Never commit directly to `main`
- Never use `--no-verify` to skip hooks

---

## Testing

Stack: **Vitest** + **React Testing Library** + **Playwright** (e2e)

### Current state

- `src/engine/` has full behavioral coverage, including a full seven-chapter playthrough with no rendering — pure functions, no rendering needed. This is the important test suite; keep it that way as chapters are added.
- Components and the language layer have tests (`LinkedText`, `Notes`, `LanguageSwitcher` and `src/content/__tests__/language.test.tsx` — 231 tests in all). Render components through `renderWithLanguage` in `src/test/render.tsx`; anything calling `useT()` throws without the provider. Most of `src/components/` and `src/app/page.tsx` still have no tests.
- `e2e/` has five real Playwright specs: `home.spec.ts` (the about screen), `notes.spec.ts` (the notebook opens from the header and every chapter is still locked at the start), `language.spec.ts` (switching mid-chapter keeps your place, flips `dir`, and re-reads a Hebrew-written rule as an English sentence), and `situation-screen.spec.ts`, which drives a full situation through a real browser and asserts scene/decide/outcome/lesson all stay visible on one screen as they accumulate, rather than replacing each other — the actual behavior the single-screen redesign depends on, not just that the final state is reachable.
- No coverage threshold is enforced yet (`vitest.config.ts` reports coverage but doesn't gate on it) — turn on the toolkit-default 80% lines/functions threshold once component tests exist, not before, or CI will fail on day one for the wrong reason.

### Rules

- Every engine function has unit tests
- Every component gets at least a render test and one interaction test, once it has one
- Tests cover: happy path, empty/null input, and at least one error case
- Name tests as: `it('returns X when Y')`
- Avoid `toBeTruthy` — assert the specific value instead
- Do not test implementation details — test behavior the user (the child) would see

### File conventions

```
src/engine/match.ts               ← source
src/engine/__tests__/engine.test.ts  ← existing engine suite (all engine tests live here)
e2e/                               ← Playwright end-to-end tests
```

### Commands

```bash
npm test                # run once
npm run test:watch      # watch mode
npm run test:coverage   # with coverage report
npm run test:e2e        # Playwright
```

Run `/review-tests` in Claude Code to audit test quality once component tests exist.

---

## Commands

```bash
npm run dev       # start dev server
npm run build     # production build
npm run lint      # ESLint
npm test          # run tests once
```

## Pre-commit hooks

Husky runs lint-staged (ESLint + Prettier) on pre-commit and the full test suite on pre-push. Never use `--no-verify`.

---

## Instructions for AI assistants

- Run lint and tests before declaring something done
- Read `docs/design.md` before changing anything under `src/engine/` or `src/content/` — the design doc's §7 (the pinch), §6 (the builder), and §8 (rights model) are load-bearing, not decoration
- Surface edge cases and error states — not just the happy path
- Add accessibility attributes to every interactive element
- Suggest before refactoring — don't restructure without asking
- If something is unclear, ask rather than assume
- When writing tests, follow the testing rules above
- Keep copy in the tone already established in `chapter1.*` — concrete, never moralizing, never naming a concept before the child has felt it (design doc §2). This holds in every language; the English is a translation of that tone, not a looser retelling.
- Character names are tokens (`village.actors.*.name`). `LinkedText` finds a mention by matching the name as a substring of the prose, so translated scene text must use the translated name or the hover tooltip silently stops appearing.

---

## Current focus / known issues

> Update this section regularly — it is the most useful thing you can tell an AI assistant.

- [x] All seven chapters are built (see `docs/chapter-1-plan.md` … `docs/chapter-7-plan.md`).
- [x] The game saves after every situation and offers to resume (`src/engine/save.ts`). Nothing half-decided is kept — coming back to an unanswered situation is kinder than coming back to a frozen half-choice.
- [x] Every subject a rule can be written about has a later situation that can make it fire (§7), and every act, protection and builder option the engine models is exercised and tested. `broke` landed at c7s4. The CONSEQUENCE clause is the honest exception: it is written into the rule sentence and never enacted, and a test records that rather than pretending otherwise.
- [x] Every component has tests, and so does `src/app/page.tsx` — `src/app/__tests__/page.test.tsx` plays the opening chapter through the real screens, which is the only way to check the wiring between engine, content and panels.
- [x] Coverage thresholds are enforced in `vitest.config.ts` (lines 85, statements 85, functions 80, branches 75), set a little under what the suite reaches. Raise them when they look slack; never lower them to make a red build green.
- [x] Hebrew and English both ship complete, switchable in place without losing the game. Adding a third language is a CSV column plus its code in `LANGUAGES` — no code change. A language with different word order would still need `rule.sentence` reshaped, which is why that whole sentence is one token.
- [ ] A situation's `noRuleOutcome` fires both when the book is empty and when a rule exists but doesn't reach the actor. Copy for it must never claim a rule exists — c4s4 shipped that bug and was caught by playing it through, not by a test, because prose can't be linted.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
