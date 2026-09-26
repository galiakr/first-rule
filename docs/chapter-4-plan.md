# Chapter 4 — "מי שלא היה כאן" (Who Wasn't Here)

> Status: **built**. See `roadmap.md` for how 5–7 follow.

## Context

Design doc §9.4: _"the passers-through arrive. The rules weren't written for them."_ The whole group exists for one question (§4): what happens to the rights of someone who wasn't in the room when the rules were written. §6 spells out the two outcomes that **both** have to be reachable, and says neither is the right answer:

- wrote _residents_ → a passer-through takes something, no rule applies, the village looks at the child and nothing happens. The gap is felt.
- wrote _anyone-present_ → the passer-through is punished by a rule they had no part in writing, and a character says it out loud: _"הוא לא היה כאן כשהחלטת את זה"_ (he wasn't here when you decided that)

At the chapter's end both halves of the concept are named together (§6): whoever the law applies to should have a part in writing it — and a law that applies to no one isn't a law.

**The engine already models all of this.** `ACTORS.noam` is `resident: false`, group `passers-through`. `whoCovers()` already excludes him from `residents` and `group` scopes and includes him under `anyone-present` and `everyone-except`. `ruleApplies()` already routes an uncovered situation to `no-rule` and a covered one to `rule-applies`. Chapter 4 is content on top of existing machinery — the lightest of the four remaining chapters, which is why the roadmap also hands it the small cross-cutting backlog.

## Key design decisions

1. **The two §6 outcomes are the `rule-applies` / `no-rule` paths, unchanged.** Which one fires depends on the WHO scope the child chose back in Chapter 1 for the relevant subject — exactly as it should. Both paths need full outcome text (the existing "every situation has all four WHAT outcomes" convention already forces this).
2. **`passers-through` never speaks.** §4: "אין להם קול בכלל" (they have no voice at all). No situation in this chapter sets `speakerGroup: "passers-through"` — someone else always reports what Noam did or what was done to him. Enforced by a content test. Trust deltas on `passers-through` are still recorded (hidden, like all trust) — they matter for Chapter 5's election.
3. **This is the first chapter to put rights effects on group `passers-through`.** §8's own example is _"הזכות לקניין שבורה — אצל העוברים"_ (the right to property, broken, for the passers-through) c4s1's punished branch is where that line finally appears on the rights board.
4. **Rule protection is asymmetric, and c4s2 shows it.** `ruleApplies` checks the _actor's_ coverage, not the victim's. So a `residents` rule protects Noam as a victim (a resident who takes from him is covered) even though it never binds him as an actor. That asymmetry is a real, unforced observation about how the child's rules work — worth one situation.
5. **c4s3/c4s4 mirror Chapter 3's shape:** feel it (c4s1, c4s2), then get a conscious chance to write a rule with the passers-through in mind (c4s3), then live with the scope you picked (c4s4).

## Content

| id   | role                                                                     | subject | act                 | actor→victim    | invitesRule | notes                                                                                                                                                                                                                        |
| ---- | ------------------------------------------------------------------------ | ------- | ------------------- | --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c4s1 | Noam takes water — the §6 fork                                           | water   | took-without-asking | **noam**→yotam  | false       | `residents`/`group` rule → `no-rule`, the gap. `anyone-present`/`everyone-except` → `rule-applies`; every WHAT outcome carries the "he wasn't here" line, and `property` (or `equality`) is **broken** for `passers-through` |
| c4s2 | a resident takes from Noam — does the book protect him?                  | things  | took-without-asking | barak→**noam**  | false       | covered regardless of scope (actor is a resident). Outcomes note that the book protected someone it never asked. Also the first collision with a `things` rule (roadmap backlog)                                             |
| c4s3 | a shared problem where passers-through obviously matter — invites a rule | land    | blocked             | dana→noam       | true        | scene makes Noam's stake explicit so the WHO choice is conscious, not accidental (§2: informative, never a trick)                                                                                                            |
| c4s4 | that rule, applied to Noam                                               | land    | blocked             | **noam**→michal | false       | `everyone-except passers-through` / `residents` → he's free and residents ask why; `anyone-present` → punished + the line. `equality` strained for whichever side lost                                                       |

Chapter epilogue (new `epilogue` field, see roadmap): the two halves of the concept, together, in words — only now.

## Engine changes

- **None to matching.** `match.ts`, `conflict.ts`, `precedent.ts`, `game.ts` untouched for the chapter itself.
- **Cross-cutting items landing here** (roadmap): per-chapter `epilogue` on the `CHAPTERS` entries and in `ChapterEnd`; the §7 two-overrides line — `overrideCount(state) === 2` shows a one-time note after the outcome, tracked with a `sawOverrideNote` flag on `GameState` exactly like `sawCollisionNote`.

## Content files, tokens, tests

- `src/content/chapter4.ts`, added to `situations.ts` and `CHAPTERS`; `chapter4.*` tokens plus the epilogue and the override-note line; regenerate locales.
- Tests: "chapter 4 content holds up" (4 situations, all WHAT outcomes, **no situation has `speakerGroup: "passers-through"`**); playthroughs proving both §6 forks at c4s1 from a `residents` rule vs an `anyone-present` rule; the override note fires on the second override and only once.

## Verification

`tsc`, lint, tests, build, both e2e specs; play through with a `residents` water rule and again with `anyone-present`, confirming the two different c4s1 screens and that "העוברים" (the passers-through) shows up on the rights board at chapter end.

## What changed in the build

- **c4s1's `power` is `victim-stronger`**, not `equal`: Noam owns nothing here and has no standing, while Yotam dug the well. It also keeps c4s1's traits from accidentally matching c1s1's, which is only cosmetic today (precedents are content-authored via `precedentOf`, never runtime-detected) but would have been a trap later.
- **c4s2 uses a blanket, and `firstOffence: false`** — Barak already took Michal's hammer in c2s1, so a `first-time-forgiven` rule bites him here. That continuity was free and worth keeping.
- **The two branches damage different rights, which is the chapter's argument in one line.** Playing it through with a `residents` water rule leaves `property` **broken** for `passers-through` (nothing protected Noam when his blanket was taken); playing it with `anyone-present` leaves `equality` **strained** for them instead (the rule fell on someone who had no part in it). §6 says neither is the right answer, and the rights board now says so without a word of commentary.
- **c4s4's no-rule copy had to be rewritten during verification.** It first read "the rule you wrote about the ground doesn't reach Noam", which is false when the child skipped writing one at c4s3 — the same outcome serves both silences. An engine test now pins both paths so the next person to touch that copy sees why it is worded the way it is.
- **§7's line landed here as planned**, as `saysOverrideNote(state, overriding)` in `game.ts` plus `sawOverrideNote` on `GameState`. It is asked _before_ resolving, with whether this decision is an override, so the UI can show it beside that decision's outcome. Twice, not once: one override is a hard case, two is a pattern, and the village only names a pattern.
- **`epilogue` is optional on a new `Chapter` type** in `types.ts`, so chapters 1–3 are unchanged and `chapters(lang)` doesn't become a union the UI can't read.
