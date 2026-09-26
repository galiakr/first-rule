# Chapter 1 — "אין כללים" (No Rules)

> Written after the fact, from the code as it stands — Chapter 1 shipped before this project kept per-chapter design docs. This is the retrospective baseline the [Chapter 2 plan](chapter-2-plan.md) builds on and follows the shape of.

## Context

Chapter 1 is the game's opening chapter: the child arrives in a village with no written rules at all, and every situation either invites them to write one or collides with one they already wrote. It exists to teach, without ever naming it, that a rule is a commitment that can cost the person who wrote it — not a statement of preference (design doc §2, §7).

## Key design decisions

1. **The rule builder is four closed fields, four options each — 16 total, no free text.** (`src/engine/options.ts`) Closed enough that the engine can evaluate a rule against any future situation with pure equality checks — no language model, no fuzzy matching, ever (design doc §6). The price is expressiveness; the payoff is that every rule the child writes is guaranteed to be something the engine can later apply, override, or collide with.
2. **The situation's subject is inherited, never chosen.** A rule about `water` (water) is mechanically incapable of covering a `path` (path) situation. This is deliberate narrowness — the child writes a rule that feels complete and then discovers it doesn't reach a case they didn't anticipate (§6, tested in "a second rule can reach a situation the first one missed").
3. **Two independent kinds of contradiction** (`src/engine/conflict.ts`, §6.2):
   - `textualConflict` — same subject, same WHO reach, incompatible WHAT clauses. Detectable from the rule text alone, so the builder warns _while writing_.
   - `fieldCollision` — only exists under specific conditions (two WHENs that both happen to hold, or a person in two groups at once). Undetectable until a real situation triggers it — so the child finds out _when it happens_, and the game says the distinction out loud, once, the first time it occurs.
4. **Rights are three states per protection per group — never points.** `intact` → `strained` → `broken`, and a strain never quietly heals a break (`src/engine/rights.ts`, §8). The rights board is the _only_ place these are shown, and only at the end of the chapter — the rule book itself never leaks who was harmed (§10).
5. **Trust is a private number that only ever surfaces as behavior.** Three levels (`comes-to-you` / `comes-but` / `stops-coming`) change how a group's dialogue opens, never a visible meter (§7).
6. **The pinch (§7) is enforced by a test, not trusted.** For every one of the four WHAT-clause options, at least one Chapter 1 situation must make choosing it cost something — a right that strains or trust that drops. `engine.test.ts`'s "pinches: every WHAT clause hurts someone in situation 3 or 4" checks this mechanically rather than relying on content review.

## Content — the four situations

| id   | title                                  | subject | act                 | justification  | power           | actor→victim | invitesRule | role                                                                             |
| ---- | -------------------------------------- | ------- | ------------------- | -------------- | --------------- | ------------ | ----------- | -------------------------------------------------------------------------------- |
| c1s1 | הבאר של יותם (Yotam's Well)            | water   | took-without-asking | needed-more    | victim-stronger | dana→yotam   | true        | invites the first-ever rule                                                      |
| c1s2 | הדוכן על השביל (The Stall on the Path) | path    | blocked             | nobody-said-no | victim-weaker   | barak→shira  | true        | invites a second rule, different subject                                         |
| c1s3 | שירה והעז (Shira and the Goat)         | water   | took-without-asking | needed-more    | equal           | shira→yotam  | false       | the pinch — whatever water rule exists collides with a character the child likes |
| c1s4 | המחסה של מיכל (Michal's Shelter)       | path    | blocked             | needed-more    | victim-weaker   | barak→michal | false       | the pinch — the path rule collides with a shelter someone needs                  |

Every situation carries an outcome for **all four** WHAT clauses plus `noRuleOutcome` and `overrideOutcome` — enforced by a test ("gives every situation an outcome for all four WHAT clauses"), because whichever rule the child actually wrote must still make sense applied to c1s3/c1s4.

## Data model (`src/engine/types.ts`)

`Situation` already carries the five trait dimensions a later precedent system would need — `act: ActKind`, `justification: Justification`, `power: PowerBalance`, `subject: Subject`, `actorId`/`victimId` — even though Chapter 1 has no precedent mechanic itself. `GameState` is a single continuous object (`rules`, `rights`, `trust`, `log`, `cursor`) meant to carry across all seven planned chapters, not reset per chapter (§10 — the book stays open the whole game).

## Engine

`src/engine/`:

- `options.ts` — the 16-option builder, `fill()` for composing a rule into one Hebrew sentence (Hebrew-grammar-specific: `{et}`/`{be}` accusative/prepositional forms, deliberately not tokenized — see `src/content/tokens`'s notes)
- `match.ts` — `whoCovers`, `whenHolds`, `ruleApplies`, `applicableRules`, `ruleSentence`
- `conflict.ts` — `textualConflict`, `fieldCollision`
- `rights.ts` — the rights board and trust, `emptyRightsBoard`, `applyRights`, `applyTrust`, `trustLevel`
- `game.ts` — the reducer: `initialState`, `promptFor` (decides what the child is asked), `outcomeFor`, `resolve`, `addRule`

All of it is pure — no React, no I/O — so a whole chapter can be played through in a test without rendering anything (`engine.test.ts`'s "playing the chapter through").

## UI

`src/app/page.tsx` drives a single-screen phase machine (`about → intro → scene → decide → outcome → lesson → end`), reading `prompt.kind` from `promptFor` to decide which of `RuleBuilder`, a rule-applies apply/override pair, a collision picker, or a plain continue button to show. `RuleBook` is open the whole game via a header button. `ChapterEnd` is the only place the rights board is shown.

## Testing

`src/engine/__tests__/engine.test.ts` — one file, organized by `describe` block per concern (builder closure, WHO/WHEN/rule-matching, sentence assembly, both conflict kinds, rights states, trust levels, prompt selection, content-holds-up checks, full playthroughs). 35 tests, all engine-level.

## Known gaps going into Chapter 2

- No precedent mechanic — every Chapter 1 situation is either freshly rule-inviting or collides with a _written rule_, never with a past _ruling_.
- Only two of five subjects used (`water`, `path`); only two of five justifications (`needed-more`, `nobody-said-no`); only two of five act kinds (`took-without-asking`, `blocked`).
- Only three of six protections exercised (`property`, `belonging`, `equality`, `shelter` — `expression` and `fair-hearing` untouched).
- Single chapter only — no chapter transition exists in the UI (`ChapterEnd` has no continue action).
