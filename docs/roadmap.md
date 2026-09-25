# Chapters 4–7 — roadmap

> Status: planned. Chapters 1–3 are built (`chapter-1-plan.md`, `chapter-2-plan.md`, `chapter-3-plan.md`). This page is the map for what's left; each chapter has its own plan doc.

## Build order and why it matters

The remaining chapters are not independent. Three engine additions flow forward:

| Introduced in            | What                                                                      | Consumed by                                                                                        |
| ------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Chapter 5                | the **authority rule** (who decides) and the **election**                 | Chapter 6 (the three jobs are staffed against it), Chapter 7 (the finale shows who holds each job) |
| Chapter 5 (book closing) | the **amendment rule** (how a rule may be changed), written behind a veil | Chapter 7 (the whole chapter branches on it)                                                       |
| Before Chapter 6         | `LogEntry.kind` — _how_ each situation was resolved                       | Chapter 6's opening replays three of the child's own moments and can't find them without it        |

So: **4 → 5 → 6 → 7, in order.** Chapter 4 is deliberately light (it's the `ovrim` chapter and the engine already models them) — a good warm-up before Chapter 5, which is the heaviest remaining chapter, comparable to Chapter 2's precedent work.

## Cross-cutting backlog (not chapter-specific)

- **§7's "two overrides" line is not built.** `overrideCount()` exists in `game.ts` and nothing calls it. After the child's second override, a character is meant to say _"אז הכללים כאן זה מה שאתה מחליט באותו רגע?"_ — the sentence the design doc says the whole game is built around. Cheap to add (a one-time note on the outcome screen, like the collision note); Chapter 4 is the natural place since it's otherwise light.
- **Per-chapter epilogue.** `ChapterEnd` has one generic closing note. Chapters 4–7 each end by naming a concept (§6's "two halves", §9's constitution line, the finale). Add an `epilogue` string per chapter entry, shown at the end instead of the shared note.
- **The book closes at the end of Chapter 5** (§10). From then on no situation may set `invitesRule: true` — enforce with a content test over Chapters 6–7, same style as the existing "content holds up" blocks.
- **`chefetz`/`davar` still aren't pinched** (carried from Chapter 2's plan). Chapter 7's rule-that-starts-to-hurt is the natural place to finally collide with one of them.

## Chapter summaries

- **4 — מי שלא היה כאן.** נעם arrives. The WHO field's two outcomes (§6) both have to be reachable: a `residents` rule leaves the gap felt, an `anyone-present` rule punishes someone who had no say — and a character says so. Almost no engine work. → `chapter-4-plan.md`
- **5 — מי מחליט מי מחליט.** Someone else starts ruling. The only fix is an authority rule, which applies to the child too. "The village chooses" is an election, decided by the trust numbers the game has been hiding all along — the first time they cash out. Ends with the book closing and the amendment rule. → `chapter-5-plan.md`
- **6 — הספר גמור, מי שומר עליו.** Replays three of the child's own moments and names the three jobs. The child staffs them; a situation blows up whichever combination they kept. → `chapter-6-plan.md`
- **7 — לשנות את מה שכבר כתוב.** A rule hurts the child; changing it goes through the amendment rule they wrote in Chapter 5 without knowing they'd need it. The real ending. → `chapter-7-plan.md`
