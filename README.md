# כלל ראשון · First Rule

A civics game for kids aged 8–12. The child arrives in a village with no
rules, writes the rules themselves — and then lives with them.

This is **Chapters 1–2** ("No Rules", "This Already Happened"), out of seven.
The full design is in `docs/design.md`; per-chapter implementation notes are
in `docs/chapter-1-plan.md` and `docs/chapter-2-plan.md`.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 52 tests over the engine and content
npm run build
```

Fonts load via `next/font/google` (Frank Ruhl Libre for the rulebook and
headings, Assistant for the interface), so the first build requires an
internet connection.

## Structure

```
src/
  engine/          the whole game, as pure functions. No React, no I/O.
    types.ts       the data model
    options.ts     the builder — 4 fields × 4 options, closed at 16
    match.ts       whether a rule applies to a situation + assembling the rule sentence
    conflict.ts    textual contradiction vs. field collision
    precedent.ts   does a past ruling apply to a new situation — trait matching
    rights.ts      the rights board and trust
    game.ts        reducer: what's asked, what happens, what's saved, chapter transitions
  content/         the village, chapters 1–2 — data only
    situations.ts  every situation keyed by id, for precedent source lookup
    tokens/        language tokens: tokens.csv is the source of truth, generate.py builds
                   locales/*.json from it, t() reads them (he complete, en blank)
  components/      rule builder, rule book, table of contents, chapter end, about screen,
                   precedent choice
  app/             a single screen driving the whole game across chapters
```

The engine knows nothing about React, so a whole chapter can be played
through in a test without rendering anything — see
`playing the chapter through` in `src/engine/__tests__/engine.test.ts`.

## What's already enforced in code

- **The builder is closed at 16.** A test fails if a fifth option is added to
  any field.
- **The pinch rule (§7).** A test runs over the four "what" options and
  verifies each one has a situation in the chapter where applying it costs
  something — a right that strains, or trust that drops.
- **Rights are states, not points.** Intact / strained / broken, always with
  a group's name attached. A strain never heals a break.
- **Trust never appears as a number on screen.** It's only revealed through
  three ways a group approaches the child.
- **The subject is inherited from the situation** rather than chosen — so
  rules come out narrower than intended, on purpose.
- **A precedent's essential traits are chosen once** (§6.1), the first time a
  situation might invoke it, and saved on the precedent itself — never as a
  global rule about what "counts" as similar.

## What's not here yet

Elections, separation of powers, constitutional amendment, save state,
English localization (chapters 3–7). `chefetz` and `davar`, the two subjects
Chapter 2 introduces, aren't pinched within Chapter 2 itself — a later
chapter needs to eventually collide with rules written for them.

## A note on writing content

Every situation needs an outcome for each of the four "what" options,
including `noRuleOutcome` and `overrideOutcome`. A test enforces this. That's
the expensive work on this project, not the code.
