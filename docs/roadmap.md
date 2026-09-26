# Chapters 4–7 — roadmap

> Status: **all seven chapters are built.** This page is now a record of how they fit together rather than a plan.

## Build order and why it matters

The remaining chapters are not independent. Three engine additions flow forward:

| Introduced in                  | What                                                                      | Consumed by                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Chapter 5                      | the **authority rule** (who decides) and the **election**                 | Chapter 6 (the three jobs are staffed against it), Chapter 7 (the finale shows who holds each job) |
| Chapter 5 (book closing)       | the **amendment rule** (how a rule may be changed), written behind a veil | Chapter 7 (the whole chapter branches on it)                                                       |
| ~~Before Chapter 6~~ _(built)_ | `LogEntry.kind` — _how_ each situation was resolved                       | Chapter 6's opening replays three of the child's own moments and can't find them without it        |

All seven are built. The dependencies below all landed in the order this page predicted, and chapter 5's `variantOutcomes` turned out to carry chapters 6 and 7 without further engine work.

**Open, and chapter 6's to answer:** losing the election sets `decider: "other"` and that persists. Chapter 6 asks the child to staff three jobs — what that means for a child who no longer decides is undecided. The honest options are that the new decider staffs them (and the child watches), or that staffing is the village's act rather than the decider's. Worth settling before writing any of chapter 6's content.

## Cross-cutting backlog (not chapter-specific)

- ~~**§7's "two overrides" line.**~~ Built with chapter 4: `saysOverrideNote()` in `game.ts` and `sawOverrideNote` on `GameState`. The line is said beside the outcome of the child's _second_ override, once ever — one override is a hard case, two is a pattern, and the village only names a pattern.
- ~~**Per-chapter epilogue.**~~ Built with chapter 4: an optional `epilogue` on the `Chapter` type in `types.ts`, rendered by `ChapterEnd` above the continue button. Chapters 1–3 have none and were left untouched.
- ~~**The book closes at the end of Chapter 5**~~ Built: `closeBook()` sets `bookClosed`, and `canWriteRules()` collapses any later write-rule prompt to no-rule. A content test over chapters 6–7 should still assert no situation sets `invitesRule` once they exist.
- ~~**`things`/`confidence` aren't pinched.**~~ Both now are: `things` across chapters 3–6, and `confidence` at c7s1, which was the last §7 gap. A test checks the whole game for this class of gap rather than trusting anyone to remember.

## Chapter summaries

- **4 — מי שלא היה כאן.** _(built)_ נעם arrives. The WHO field's two outcomes (§6) both have to be reachable: a `residents` rule leaves the gap felt, an `anyone-present` rule punishes someone who had no say — and a character says so. Almost no engine work; the two branches end up damaging different rights, which is §6's point stated by the rights board rather than by narration. → `chapter-4-plan.md`
- **5 — מי מחליט מי מחליט.** _(built)_ Someone else starts ruling. The only fix is an authority rule, which applies to the child too. "The village chooses" is an election, decided by the trust numbers the game has been hiding all along — the first time they cash out. Ends with the book closing and the amendment rule. → `chapter-5-plan.md`
- **6 — הספר גמור, מי שומר עליו.** _(built)_ Replays three of the child's own moments and names the three jobs. The child staffs them; a situation blows up whichever combination they kept. → `chapter-6-plan.md`
- **7 — לשנות את מה שכבר כתוב.** _(built)_ A rule hurts the child; changing it goes through the amendment rule they wrote in Chapter 5 without knowing they'd need it. The real ending. → `chapter-7-plan.md`
