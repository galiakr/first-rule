# כלל ראשון · First Rule

A civics game for kids aged 8–12. The child arrives in a village with no
rules, writes the rules themselves — and then lives with them.

This is **Chapters 1–5**, out of seven — ending where the village closes its
rule book for good. The full design is in `docs/design.md`;
per-chapter implementation notes are in `docs/chapter-1-plan.md` …
`docs/chapter-5-plan.md`. Chapters 6–7 are planned but not built — see
`docs/roadmap.md` for build order and `docs/chapter-6-plan.md` /
`docs/chapter-7-plan.md` for each.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 146 tests over the engine, content and components
npm run build
```

Fonts load via `next/font/google` (Frank Ruhl Libre for the rulebook and
headings, Assistant for the interface), so the first build requires an
internet connection.

## Languages

The game ships in Hebrew and English, switchable from the header at any
point. Switching is live — it keeps your rules, your precedents and your
place in the chapter, and only the words change. The page direction follows
(`rtl` / `ltr`), and the choice is remembered.

All text, including the character names and the fragments the rule book
assembles into a sentence, lives in `src/content/tokens/tokens.csv` — one row
per string, one column per language. A non-coder can edit that file in Excel
or Sheets. After editing, regenerate the JSON the app reads:

```bash
python3 src/content/tokens/generate.py src/content/tokens/tokens.csv \
  --out src/content/tokens/locales
```

Adding a third language is a new column plus its code in `LANGUAGES`
(`src/content/tokens/index.ts`); nothing else in the app changes. Any string
left blank falls back to Hebrew rather than rendering empty.

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
  content/         the village, chapters 1–5 — data only
    situations.ts  every situation keyed by id, for precedent source lookup
    tokens/        language tokens: tokens.csv is the source of truth, generate.py builds
                   locales/*.json from it (he and en both complete)
  components/      rule builder, rule book, notebook, table of contents, chapter end,
                   about screen, precedent choice, language switcher
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
- **The child has no group of their own** (Chapter 3, §4) — a rule scoped to
  a specific group can never reach them, but `everyone-except` always does,
  since they can never be the excluded group.

## What's not here yet

Separation of powers, constitutional amendment, save state (chapters 6–7). `chefetz` and `davar`, the two subjects
Chapter 2 introduces, aren't pinched within Chapter 2 itself — a later
chapter needs to eventually collide with rules written for them.

## A note on writing content

Every situation needs an outcome for each of the four "what" options,
including `noRuleOutcome` and `overrideOutcome`. A test enforces this. That's
the expensive work on this project, not the code.
