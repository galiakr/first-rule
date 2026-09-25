# Chapters 4–7 — roadmap

> Status: chapters 1–5 are built, and the book is closed. This page is the map for what's left (6–7); each chapter has its own plan doc.

## Build order and why it matters

The remaining chapters are not independent. Three engine additions flow forward:

| Introduced in            | What                                                                      | Consumed by                                                                                        |
| ------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Chapter 5                | the **authority rule** (who decides) and the **election**                 | Chapter 6 (the three jobs are staffed against it), Chapter 7 (the finale shows who holds each job) |
| Chapter 5 (book closing) | the **amendment rule** (how a rule may be changed), written behind a veil | Chapter 7 (the whole chapter branches on it)                                                       |
| Before Chapter 6         | `LogEntry.kind` — _how_ each situation was resolved                       | Chapter 6's opening replays three of the child's own moments and can't find them without it        |

So: **6 → 7, in order.** Chapters 4 and 5 are built. Chapter 5 delivered both things the later chapters need — the authority rule with its election, and the amendment rule written behind a veil — plus a general `variantOutcomes` mechanism chapter 6 can reuse for its three jobs without touching the engine.

**Open, and chapter 6's to answer:** losing the election sets `decider: "other"` and that persists. Chapter 6 asks the child to staff three jobs — what that means for a child who no longer decides is undecided. The honest options are that the new decider staffs them (and the child watches), or that staffing is the village's act rather than the decider's. Worth settling before writing any of chapter 6's content.

## Cross-cutting backlog (not chapter-specific)

- **§7's "two overrides" line is not built.** `overrideCount()` exists in `game.ts` and nothing calls it. After the child's second override, a character is meant to say _"אז הכללים כאן זה מה שאתה מחליט באותו רגע?"_ — the sentence the design doc says the whole game is built around. Cheap to add (a one-time note on the outcome screen, like the collision note); Chapter 4 is the natural place since it's otherwise light.
- **Per-chapter epilogue.** `ChapterEnd` has one generic closing note. Chapters 4–7 each end by naming a concept (§6's "two halves", §9's constitution line, the finale). Add an `epilogue` string per chapter entry, shown at the end instead of the shared note.
- ~~**The book closes at the end of Chapter 5**~~ Built: `closeBook()` sets `bookClosed`, and `canWriteRules()` collapses any later write-rule prompt to no-rule. A content test over chapters 6–7 should still assert no situation sets `invitesRule` once they exist.
- **`chefetz`/`davar` still aren't pinched** (carried from Chapter 2's plan). Chapter 7's rule-that-starts-to-hurt is the natural place to finally collide with one of them.

## Chapter summaries

- **4 — מי שלא היה כאן.** _(built)_ נעם arrives. The WHO field's two outcomes (§6) both have to be reachable: a `residents` rule leaves the gap felt, an `anyone-present` rule punishes someone who had no say — and a character says so. Almost no engine work; the two branches end up damaging different rights, which is §6's point stated by the rights board rather than by narration. → `chapter-4-plan.md`
- **5 — מי מחליט מי מחליט.** _(built)_ Someone else starts ruling. The only fix is an authority rule, which applies to the child too. "The village chooses" is an election, decided by the trust numbers the game has been hiding all along — the first time they cash out. Ends with the book closing and the amendment rule. → `chapter-5-plan.md`
- **6 — הספר גמור, מי שומר עליו.** Replays three of the child's own moments and names the three jobs. The child staffs them; a situation blows up whichever combination they kept. → `chapter-6-plan.md`
- **7 — לשנות את מה שכבר כתוב.** A rule hurts the child; changing it goes through the amendment rule they wrote in Chapter 5 without knowing they'd need it. The real ending. → `chapter-7-plan.md`
