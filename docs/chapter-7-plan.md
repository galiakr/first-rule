# Chapter 7 — "לשנות את מה שכבר כתוב" (Changing What's Already Written)

> Status: **built**. The last chapter — the game is complete at seven.

## Context

Design doc §9.7: a rule in the book starts to hurt, and this time **the child** wants to change it. They can't just delete it — they go through the same path they set for everyone, the amendment rule they wrote at the end of Chapter 5 without knowing they'd need it. Four branches, one per form:

- _who wrote it can change it_ → changed in a second; then someone says out loud that this means one person can cancel everything — and demonstrates.
- _two must agree_ → they have to persuade, and who has to agree isn't necessarily who's convenient.
- _the whole village_ → slow, and someone is hurt in the meantime.
- _it can't be changed_ → stuck with their own rule, and it stays that way to the end. §13: "I lean toward leaving them stuck."

This is the chapter where it's said that a constitution is a promise you make to your future self, before you know what you'll want then. And §10: **the real ending** is here — no victory, no score. Just the book, who holds each of the three jobs, and what it cost the child to change something in it.

## Key design decisions

1. **The rule that hurts is one the child actually wrote, found at runtime.** Prefer a `things` or `confidence` rule (roadmap: those subjects were never pinched), falling back to any rule in the book. The child is the actor (`CHILD_ACTOR`, Chapter 3's mechanism) — it's _their_ rule biting _them_, one more time, but now the book is closed and the only exit is the amendment path. If the book is somehow empty (the child skipped every rule), the chapter opens on a different, authored beat: there was nothing to change, and that was its own choice. Tested.
2. **The amendment path is a single engine function with four behaviours.** `attemptAmendment(state, ruleId, next): AmendmentResult` returns one of `applied` (author), `needs-agreement` (two-agree — resolved by trust: the character who benefits from the current rule agrees iff their group is `comes-to-you`; otherwise refused), `delayed` (whole-village — takes effect only after the next situation resolves), `refused` (cannot). Same trust-as-the-village's-voice idea as Chapters 5–6; no new hidden state.
3. **"Cannot be changed" stays stuck. No exit.** Following §13's lean. The remaining situations then play under the unchanged rule, and the ending names that honestly. If a real child turns out to need an exit, that's a content change later, not a mechanic to build now.
4. **The demonstration in the "author" branch is a real second amendment.** After the child changes their rule in a second, a character (Yotam, who holds authority if the child lost in Chapter 5, or simply the most senior) changes _another_ rule the same way, against the child's interest — using the very same `attemptAmendment` path. The lesson is shown, not told.
5. **The finale is a `ChapterEnd` variant that shows exactly what §10 lists**, nothing more: the book as it stands; who holds legislative / judicial / executive (from `separation`); and what changing something cost — rendered from the trust/rights deltas of this chapter's amendment attempt. No summary of the whole game, no grade.

## Content

| id   | role                                                                               | invitesRule | notes                                                                                                                                                                                                               |
| ---- | ---------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c7s1 | the child's own rule bites them (actor: `you`) — and this time they'd like it gone | false       | outcome ends by naming the door: the amendment rule they wrote at the end of Chapter 5                                                                                                                              |
| c7s2 | **the attempt** — branches four ways on `amendment`                                | false       | author → instant, then the demonstration (decision #4); two-agree → the ask, and its answer; whole-village → "it will change, after…"; cannot → refused, in-world                                                   |
| c7s3 | living under the result                                                            | false       | author: the rule Yotam changed now hurts; two-agree: refused → the rule still bites, or agreed → relief with a debt; whole-village: the delay bites someone else first (who?); cannot: the rule bites again, harder |
| c7s4 | the last situation of the game                                                     | false       | quiet. A small case the book handles on its own, whoever holds the jobs — the point is that the village runs                                                                                                        |

Then the finale (decision #5), and the line about the promise to your future self — epilogue, said once.

## Data model / engine

- `types.ts`: `AmendmentResult`; `GameState.pendingAmendment: { ruleId; next; appliesAfter: string } | null` for the whole-village delay.
- `src/engine/amendment.ts` (new, pure): `attemptAmendment`, `applyPendingAmendment(state)` (called by `resolve()` when the delay elapses), `demonstrationTarget(state)` (which other rule the character changes in the author branch — the one whose `writtenAt` is earliest, for maximal sting).
- `game.ts`: `replaceRule` (from Chapter 5) and a `removeRule`; `resolve()` applies pending amendments.
- Tests: all four `attemptAmendment` behaviours; two-agree honours trust; delay applies exactly one situation later; the empty-book fallback; a full 7-chapter playthrough in the engine (28 situations, no rendering) — the README's "playing the chapter through" idea, at last for the whole game.

## UI

- `AmendmentAttempt` screen: the rule as it is, the child's proposed change (reopen `RuleBuilder` on it, as in Chapter 5's change-one-rule step), and the in-world response per branch.
- `ChapterEnd` finale variant (decision #5).

## Open questions, as answered

- **The rule that hurts is the one that just bit them**, at c7s1, with the oldest rule in the book as the fallback and an authored "there was nothing to change" beat when the book is empty. Better than the plan's "oldest" lean: it is the rule the child has a live reason to want changed, rather than one the game picked for them.
- **The whole-village delay breaks a right**, not just trust — closer to the doc, and it should be: the person standing inside the wait did nothing except arrive a day too early.
- **One refusal is final.** One round, like the election in chapter 5.

## What changed in the build

- **c7s1 is a `confidence` situation, and that clears a standing §7 violation.** The subject was introduced at c2s2 and never pinched again, so a rule written there could never fire a second time. A new test now checks the whole game for this class of gap — every situation that invites a rule must have a later situation on the same subject — and it passes for all seven chapters.
- **The bite was chosen so the child wants the rule _changed_, not merely resented.** The rule protects what was told in confidence; here keeping it means nobody can help Shira. A rule doing exactly what it says, and costing exactly what it costs.
- **`mustAgree` needed an authored stakeholder.** Falling through to "whoever trusts you least" made the two-agree branch refuse nearly every time — after two dozen situations some group has always slipped, so one of the four endings was effectively dead. The situation now names who is on the other side of the specific rule (`children`, whose confidence it protects), which is truer and winnable.
- **`replaceRule` was letting a rewrite change a rule's subject.** §6 says the subject is inherited from the situation that produced it and is never chosen; a playthrough put two rules about the same thing in the book because of it. Rewrites may now change the four clauses and nothing else. This also affected chapter 5's change-one-rule step.
- **The engine now plays the whole game end to end in a test** — 28 situations, seven chapters, no rendering. The README has claimed the engine is React-free since chapter 1; this is the proof, and it is the one test that would catch a chapter wiring itself into a dead end.
