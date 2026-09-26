# Chapter 6 — "הספר גמור — מי שומר עליו" (The Book Is Done — Who Guards It)

> Status: **built**. Only chapter 7 is left; see `roadmap.md`.

## Context

Design doc §9.6, in two halves. **Opening:** the game replays three moments from the child's _own_ game — a time they wrote a rule, a time they ruled in a conflict, a time they made sure something actually happened — and attaches a name to each. They've been doing all three jobs the whole time without noticing. The doc calls this the strongest teaching moment in the game, and it costs almost no new content. **Then:** three slots, and the child staffs each — themselves, a character, a group, or "the village chooses."

**The pinch:** a situation arrives that blows up exactly the combination they kept. Kept both writing and judging → they judge a case where the rule they wrote favours them, and a character says the judge is the one who wrote it. Split them → the one they appointed rules against them, and they choose between living with it and revoking — and losing everything they built.

The book is closed (§10), so nothing in this chapter invites a rule.

## Key design decisions

1. **The replay needs the log to say _how_ each situation was resolved — it doesn't today.** `LogEntry` records `appliedRuleIds` and `overrode`, nothing else. Add `kind: "wrote-rule" | "applied-rule" | "overrode" | "ruled-by-precedent" | "chose-in-collision" | "no-rule"`, set in `resolve()` from the `Prompt` that was on screen (`page.tsx` already snapshots it as `decidedPrompt`; pass its kind into `Resolution`). Backward compatible; must land **before** Chapter 6 (roadmap). Then the three moments are just three log lookups:
   - legislative = the most recent `wrote-rule`
   - judicial = the most recent `ruled-by-precedent` or `chose-in-collision`
   - executive = the most recent `applied-rule` (enforcing a rule as written — "making sure it happened")
     With twenty situations behind the child, all three normally exist. A content test asserts the replay can't render blank; if one kind never happened, the opening says so in-world instead ("you never once…") rather than inventing a moment.
2. **Holders are a small closed type.** `Holder = "you" | { actorId } | { groupId } | "village"`. `GameState.separation: { legislative: Holder; judicial: Holder; executive: Holder } | null`. "The village chooses" resolves deterministically to the highest-trust group (ties → the group that came first in `GROUPS`) — reusing Chapter 5's idea that trust is the village's voice. **Open:** whether that should instead run a Chapter 5-style election per slot.
3. **The pinch situations branch on the assignment, not on WHAT.** c6s3/c6s4 each carry two outcome variants beyond the usual four: `heldByYou` and `heldByOther` text for the relevant slot. Keeps the existing `outcomes` record intact (a rule may still apply and needs its WHAT-keyed outcomes) and adds one small, explicit fork.
4. **Revoking is real loss.** Choosing to revoke resets `separation` to all-`"you"` and drops every group to `stops-coming` (`applyTrust` with −3 across the board) — the arrangement was rescinded, so nobody trusts any arrangement. Strong on purpose; §9 says "loses everything he built." **Open:** whether rights should also strain (`fair-hearing` for the appointee's group is the natural one).

## Content

| id         | role                                                                                                             | invitesRule | notes                                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| — opening  | the three replayed moments, each named (חקיקה · שפיטה · ביצוע, said once, here, for the first time)              | —           | rendered from the log, not authored                                                                                                          |
| — staffing | three slots                                                                                                      | —           | the child assigns each; `RuleBook` shows the assignment from now on                                                                          |
| c6s1       | a routine case handled by whoever holds the judicial slot                                                        | false       | if not the child: they watch. Confirms the assignment has teeth                                                                              |
| c6s2       | a rule needs enforcing (executive slot) against a character the child likes                                      | false       | Chapter 3's move, now through the slot: if the child holds it, they enforce it themselves                                                    |
| c6s3       | **the pinch, kept-together branch**: a case where the child's own rule favours the child, and they hold judicial | false       | a character says the judge is the one who wrote it. If they _didn't_ keep both, this situation instead shows the appointee ruling it cleanly |
| c6s4       | **the pinch, split branch**: the appointee rules against the child                                               | false       | choice: live with it, or revoke (decision #4). If they kept everything, this shows the cost of that instead                                  |

Epilogue: what the three jobs are for, now that the child has felt what happens when one person holds all of them.

## Data model / engine

- `types.ts`: `LogEntry.kind`, `Holder`, `Separation`; `GameState.separation`.
- `src/engine/separation.ts` (new, pure): `keyMoments(state)` (the three lookups), `resolveHolder(state, holder)` (who a slot actually is right now, incl. "village"), `assignSeparation`, `revokeSeparation`.
- `game.ts`: `resolve()` writes `kind`; `Resolution` gains `kind`.
- Tests: `keyMoments` finds the right entries and reports absence honestly; `resolveHolder("village")` is deterministic; revoke drops all trust; content test that no Chapter 6 situation has `invitesRule: true`.

## UI

- `KeyMoments` screen (three cards, each: the situation title, what the child did, and its name).
- `SeparationBuilder` (three slot pickers; each offers you / characters / groups / village).
- `ChapterEnd` for 6: shows who holds each job.

## Open questions, as answered

- **Staffing is the village's act, not the decider's.** (Owner's call.) The child assigns the three jobs whether or not they lost chapter 5's election — appointing who guards the book is constitutional, not day-to-day, so it does not belong to whoever happens to be ruling. In-world the village turns to the child because they are the one who wrote the book. A child who lost gets a line acknowledging exactly that: יותם decides what happens on an ordinary day, and this is not an ordinary day.
- **"The village chooses" resolves to the highest-trust group**, ties broken by `GROUPS` order — not a per-slot election. Chapter 5 already spent a whole chapter on a vote; running three more here would repeat the beat rather than build on it, and trust-as-the-village's-voice is the same idea without the ceremony.
- **Revoking costs trust across the board and strains `fair-hearing` for the appointee's group.** The rights half lives in `revokeSeparation()` rather than in the outcome's `rights` array, which is the one place in the game where a consequence is computed instead of authored — because it depends on who was appointed, and static content cannot know that.
- **The replay uses the _first_ moment of each kind, not the most recent.** "You did this before you knew what it was called" is the whole point of the opening.

## What changed in the build

- **The replay costs no authored content at all**, as the plan hoped. `keyMoments(state)` is three `log.find` calls; the only thing the game adds is the word for what the child was doing. A job they never did says so, rather than substituting a different moment — and going against a rule deliberately does _not_ count as having enforced one, which is §7's subject, not §9.6's.
- **`separationVariants` layers on chapter 5's `variantOutcomes`** rather than adding a mechanism. Each situation gets three keys, most specific first, and picks up the one it defines. Chapter 5's generalisation paid for itself exactly as intended.
- **The revoke choice replaces the whole decide UI**, rather than sitting beside it. A playthrough showed that an ordinary `things` rule can fire on c6s4 — very likely, given chapters 2, 3 and 5 all invite one — which would have rendered the apply/override buttons _and_ the revoke choice together. When the arrangement has ruled against the child, the only question on screen is whether they keep to it.
- **Revoke is offered only when somebody else holds the judging.** Keeping the job yourself leaves nothing to revoke, and c6s4's `kept-together` variant covers that case instead: the child rules against themselves, and nobody — including them — can tell whether it was the rule or the audience.
- **`holderLabel` is the one engine function that reads tokens for presentation.** It has to, because "the village" resolves to a group only at the moment it is read.

## Carried forward

Chapter 7 now has everything it needs: the amendment rule from chapter 5, and `separation` for the finale's "who holds each of the three jobs". The one content debt still outstanding is `confidence`, written at c2s2 and never pinched — chapter 7's rule-that-starts-to-hurt is its last chance.
