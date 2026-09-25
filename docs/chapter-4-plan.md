# Chapter 4 — "מי שלא היה כאן" (Who Wasn't Here)

> Status: planned, not yet built. See `roadmap.md` for how this fits with 5–7.

## Context

Design doc §9.4: _"the passers-through arrive. The rules weren't written for them."_ The whole group exists for one question (§4): what happens to the rights of someone who wasn't in the room when the rules were written. §6 spells out the two outcomes that **both** have to be reachable, and says neither is the right answer:

- wrote _residents_ → a passer-through takes something, no rule applies, the village looks at the child and nothing happens. The gap is felt.
- wrote _anyone-present_ → the passer-through is punished by a rule they had no part in writing, and a character says it out loud: _"הוא לא היה כאן כשהחלטת את זה."_

At the chapter's end both halves of the concept are named together (§6): whoever the law applies to should have a part in writing it — and a law that applies to no one isn't a law.

**The engine already models all of this.** `ACTORS.noam` is `resident: false`, group `ovrim`. `whoCovers()` already excludes him from `residents` and `group` scopes and includes him under `anyone-present` and `everyone-except`. `ruleApplies()` already routes an uncovered situation to `no-rule` and a covered one to `rule-applies`. Chapter 4 is content on top of existing machinery — the lightest of the four remaining chapters, which is why the roadmap also hands it the small cross-cutting backlog.

## Key design decisions

1. **The two §6 outcomes are the `rule-applies` / `no-rule` paths, unchanged.** Which one fires depends on the WHO scope the child chose back in Chapter 1 for the relevant subject — exactly as it should. Both paths need full outcome text (the existing "every situation has all four WHAT outcomes" convention already forces this).
2. **`ovrim` never speaks.** §4: "אין להם קול בכלל." No situation in this chapter sets `speakerGroup: "ovrim"` — someone else always reports what נעם did or what was done to him. Enforced by a content test. Trust deltas on `ovrim` are still recorded (hidden, like all trust) — they matter for Chapter 5's election.
3. **This is the first chapter to put rights effects on group `ovrim`.** §8's own example is _"הזכות לקניין שבורה — אצל העוברים."_ c4s1's punished branch is where that line finally appears on the rights board.
4. **Rule protection is asymmetric, and c4s2 shows it.** `ruleApplies` checks the _actor's_ coverage, not the victim's. So a `residents` rule protects נעם as a victim (a resident who takes from him is covered) even though it never binds him as an actor. That asymmetry is a real, unforced observation about how the child's rules work — worth one situation.
5. **c4s3/c4s4 mirror Chapter 3's shape:** feel it (c4s1, c4s2), then get a conscious chance to write a rule with the passers-through in mind (c4s3), then live with the scope you picked (c4s4).

## Content

| id   | role                                                                     | subject | act                 | actor→victim    | invitesRule | notes                                                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------ | ------- | ------------------- | --------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c4s1 | נעם takes water — the §6 fork                                            | mayim   | took-without-asking | **noam**→yotam  | false       | `residents`/`group` rule → `no-rule`, the gap. `anyone-present`/`everyone-except` → `rule-applies`; every WHAT outcome carries the "he wasn't here" line, and `kinyan` (or `shivyon`) is **broken** for `ovrim` |
| c4s2 | a resident takes from נעם — does the book protect him?                   | chefetz | took-without-asking | barak→**noam**  | false       | covered regardless of scope (actor is a resident). Outcomes note that the book protected someone it never asked. Also the first collision with a `chefetz` rule (roadmap backlog)                               |
| c4s3 | a shared problem where passers-through obviously matter — invites a rule | shetach | blocked             | dana→noam       | true        | scene makes נעם's stake explicit so the WHO choice is conscious, not accidental (§2: informative, never a trick)                                                                                                |
| c4s4 | that rule, applied to נעם                                                | shetach | blocked             | **noam**→michal | false       | `everyone-except ovrim` / `residents` → he's free and residents ask why; `anyone-present` → punished + the line. `shivyon` strained for whichever side lost                                                     |

Chapter epilogue (new `epilogue` field, see roadmap): the two halves of the concept, together, in words — only now.

## Engine changes

- **None to matching.** `match.ts`, `conflict.ts`, `precedent.ts`, `game.ts` untouched for the chapter itself.
- **Cross-cutting items landing here** (roadmap): per-chapter `epilogue` on the `CHAPTERS` entries and in `ChapterEnd`; the §7 two-overrides line — `overrideCount(state) === 2` shows a one-time note after the outcome, tracked with a `sawOverrideNote` flag on `GameState` exactly like `sawCollisionNote`.

## Content files, tokens, tests

- `src/content/chapter4.ts`, added to `situations.ts` and `CHAPTERS`; `chapter4.*` tokens plus the epilogue and the override-note line; regenerate locales.
- Tests: "chapter 4 content holds up" (4 situations, all WHAT outcomes, **no situation has `speakerGroup: "ovrim"`**); playthroughs proving both §6 forks at c4s1 from a `residents` rule vs an `anyone-present` rule; the override note fires on the second override and only once.

## Verification

`tsc`, lint, tests, build, both e2e specs; play through with a `residents` water rule and again with `anyone-present`, confirming the two different c4s1 screens and that "העוברים" shows up on the rights board at chapter end.
