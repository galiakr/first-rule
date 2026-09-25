# Chapter 7 — "לשנות את מה שכבר כתוב" (Changing What's Already Written)

> Status: planned, not yet built. Depends on Chapter 5's amendment rule and Chapter 6's separation. This is the ending.

## Context

Design doc §9.7: a rule in the book starts to hurt, and this time **the child** wants to change it. They can't just delete it — they go through the same path they set for everyone, the amendment rule they wrote at the end of Chapter 5 without knowing they'd need it. Four branches, one per form:

- _who wrote it can change it_ → changed in a second; then someone says out loud that this means one person can cancel everything — and demonstrates.
- _two must agree_ → they have to persuade, and who has to agree isn't necessarily who's convenient.
- _the whole village_ → slow, and someone is hurt in the meantime.
- _it can't be changed_ → stuck with their own rule, and it stays that way to the end. §13: "I lean toward leaving them stuck."

This is the chapter where it's said that a constitution is a promise you make to your future self, before you know what you'll want then. And §10: **the real ending** is here — no victory, no score. Just the book, who holds each of the three jobs, and what it cost the child to change something in it.

## Key design decisions

1. **The rule that hurts is one the child actually wrote, found at runtime.** Prefer a `chefetz` or `davar` rule (roadmap: those subjects were never pinched), falling back to any rule in the book. The child is the actor (`CHILD_ACTOR`, Chapter 3's mechanism) — it's _their_ rule biting _them_, one more time, but now the book is closed and the only exit is the amendment path. If the book is somehow empty (the child skipped every rule), the chapter opens on a different, authored beat: there was nothing to change, and that was its own choice. Tested.
2. **The amendment path is a single engine function with four behaviours.** `attemptAmendment(state, ruleId, next): AmendmentResult` returns one of `applied` (author), `needs-agreement` (two-agree — resolved by trust: the character who benefits from the current rule agrees iff their group is `comes-to-you`; otherwise refused), `delayed` (whole-village — takes effect only after the next situation resolves), `refused` (cannot). Same trust-as-the-village's-voice idea as Chapters 5–6; no new hidden state.
3. **"Cannot be changed" stays stuck. No exit.** Following §13's lean. The remaining situations then play under the unchanged rule, and the ending names that honestly. If a real child turns out to need an exit, that's a content change later, not a mechanic to build now.
4. **The demonstration in the "author" branch is a real second amendment.** After the child changes their rule in a second, a character (יותם, who holds authority if the child lost in Chapter 5, or simply the most senior) changes _another_ rule the same way, against the child's interest — using the very same `attemptAmendment` path. The lesson is shown, not told.
5. **The finale is a `ChapterEnd` variant that shows exactly what §10 lists**, nothing more: the book as it stands; who holds legislative / judicial / executive (from `separation`); and what changing something cost — rendered from the trust/rights deltas of this chapter's amendment attempt. No summary of the whole game, no grade.

## Content

| id   | role                                                                               | invitesRule | notes                                                                                                                                                                                                              |
| ---- | ---------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| c7s1 | the child's own rule bites them (actor: `you`) — and this time they'd like it gone | false       | outcome ends by naming the door: the amendment rule they wrote at the end of Chapter 5                                                                                                                             |
| c7s2 | **the attempt** — branches four ways on `amendment`                                | false       | author → instant, then the demonstration (decision #4); two-agree → the ask, and its answer; whole-village → "it will change, after…"; cannot → refused, in-world                                                  |
| c7s3 | living under the result                                                            | false       | author: the rule יותם changed now hurts; two-agree: refused → the rule still bites, or agreed → relief with a debt; whole-village: the delay bites someone else first (who?); cannot: the rule bites again, harder |
| c7s4 | the last situation of the game                                                     | false       | quiet. A small case the book handles on its own, whoever holds the jobs — the point is that the village runs                                                                                                       |

Then the finale (decision #5), and the line about the promise to your future self — epilogue, said once.

## Data model / engine

- `types.ts`: `AmendmentResult`; `GameState.pendingAmendment: { ruleId; next; appliesAfter: string } | null` for the whole-village delay.
- `src/engine/amendment.ts` (new, pure): `attemptAmendment`, `applyPendingAmendment(state)` (called by `resolve()` when the delay elapses), `demonstrationTarget(state)` (which other rule the character changes in the author branch — the one whose `writtenAt` is earliest, for maximal sting).
- `game.ts`: `replaceRule` (from Chapter 5) and a `removeRule`; `resolve()` applies pending amendments.
- Tests: all four `attemptAmendment` behaviours; two-agree honours trust; delay applies exactly one situation later; the empty-book fallback; a full 7-chapter playthrough in the engine (28 situations, no rendering) — the README's "playing the chapter through" idea, at last for the whole game.

## UI

- `AmendmentAttempt` screen: the rule as it is, the child's proposed change (reopen `RuleBuilder` on it, as in Chapter 5's change-one-rule step), and the in-world response per branch.
- `ChapterEnd` finale variant (decision #5).

## Open questions

- Which subject the hurting rule should prefer, if the child wrote several candidates — lean: the _oldest_ rule in the book, since it's the one they least remember choosing.
- Whether the whole-village branch's "someone hurt meanwhile" should be a rights break or only trust — a break is closer to the doc's wording.
- The two-agree refusal: is one refusal final, or may the child try once more after a situation passes? Lean: final. One round, like the election.
