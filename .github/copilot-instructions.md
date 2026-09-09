# GitHub Copilot Instructions

> Keep this in sync with `AGENTS.md` at the repo root — they serve the same purpose for different tools. If they drift, run the `sync-context` Claude skill.

## Project context

כלל ראשון · First Rule — a Hebrew, RTL civics/democracy game for kids 8–12. A child arrives in a village with no rules, writes them over the course of the game, and lives under them. Chapter 1 of a planned seven is implemented. Design source of truth: `design-first-rule.md` at the repo root.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS. No backend, no database.

## Conventions

- Functional components, one default export per file, TypeScript strict
- Tailwind for all styling, against the custom palette in `tailwind.config.ts` — no inline styles, no CSS modules
- All UI copy is Hebrew, RTL
- Engine code (`src/engine/`) is pure functions only — no React, no I/O
- Co-locate engine tests in `src/engine/__tests__/`
- Use Vitest and React Testing Library for tests

## Game-design invariants

Read `design-first-rule.md` before changing `src/engine/` or `src/content/`. Key ones enforced by tests: the rule builder is closed at 16 options (4 fields × 4), every writable rule needs a future situation where it costs the child ("the pinch", §7), rights are states (`intact`/`strained`/`broken`) never points, and trust is never shown as a number.

## When writing tests

- Always assert specific values — avoid `toBeTruthy` when `toBe('value')` is possible
- Cover the happy path, the empty/null case, and at least one error case
- Name tests as: `it('returns X when Y')`

## When writing components

- Always include accessibility attributes: `alt`, `aria-label`, `role` where needed
- Use semantic HTML first — `<button>` not `<div onClick>`
- Keyboard navigation must work without a mouse

## What to avoid

- No `any` in TypeScript
- No `useEffect` for derived data
- No `--no-verify` on commits
- No hardcoded secrets or API keys
- No runtime language model, multiplayer, voice narration, or free-text rule editor — out of scope for this version (design doc §11)
