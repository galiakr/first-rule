# Roadmap — all seven chapters

> Status: **the game is complete.** All seven chapters are built, in Hebrew and English. This page is no longer a plan; it is the record of what each chapter is for, what it added to the engine, and how they depend on one another.
>
> Per-chapter detail lives in `chapter-1-plan.md` … `chapter-7-plan.md`. The design doc (`design.md`, Hebrew) remains the source of truth for _why_ any of it works this way.

## The shape of the game

Twenty-eight situations, four per chapter (§9). Inside a chapter, the first two present a gap and invite a rule; the third and fourth collide with whatever was written. The child writes every rule in the book, and then lives under it.

Two laws govern all the content, and both are now enforced by tests rather than by memory:

- **The pinch (§7).** For every rule the child can write there is at least one later situation where applying it costs them, someone they like, or the weakest group. Tested at the level of the value: every WHO scope, every WHEN clause, every WHAT clause, and every subject a rule can be written about.
- **Felt first, named afterwards (§2).** No concept is named before the child has lived through it. The notebook unlocks a chapter's note only once that chapter is finished, and the game never tells the child they were wrong.

## The seven chapters

| #   | Title                                                 | What it is for                                                                                                                                                 | Plan                |
| --- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | "אין כללים" — **No Rules**                            | Three situations with nothing to lean on, then the first rule is written. A rule is a decision made in advance.                                                | `chapter-1-plan.md` |
| 2   | "זה כבר קרה" — **This Already Happened**              | Similar cases return. The child says once what made two cases alike, and a precedent is born out of their own answer.                                          | `chapter-2-plan.md` |
| 3   | "הכלל שלך נגדך" — **Your Rule Against You**           | The rules land on the child themselves, and on someone they are fond of. A rule that does not apply to you is a request.                                       | `chapter-3-plan.md` |
| 4   | "מי שלא היה כאן" — **Who Wasn't Here**                | The passers-through arrive. A field picked chapters ago decides whether the book can see them at all — and neither answer is the right one (§6).               | `chapter-4-plan.md` |
| 5   | "מי מחליט מי מחליט" — **Who Decides Who Decides**     | Two people rule at once and both are equally right. The authority rule settles it, the election cashes out five chapters of hidden trust, and the book closes. | `chapter-5-plan.md` |
| 6   | "הספר גמור — מי שומר עליו" — **The Book Is Done**     | Three of the child's own moments are replayed and named. They staff the three jobs, and a case blows up whichever combination they kept.                       | `chapter-6-plan.md` |
| 7   | "לשנות את מה שכבר כתוב" — **Changing What's Written** | A rule starts to hurt, and the child must use the amendment rule they wrote behind a veil in chapter 5. The real ending.                                       | `chapter-7-plan.md` |

## What each chapter added to the engine

Chapters 1–3 built the machine. Chapter 4 was almost pure content. Chapter 5 was the heaviest, and paid for both of the chapters after it.

| Chapter | Engine work                                                                                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | The closed 16-option rule builder, `whoCovers` / `whenHolds` / `ruleApplies`, rights as states, and trust as a hidden number that surfaces only as behaviour.    |
| 2       | Precedents: exact matching on a subset of traits the child chooses once, per precedent. Textual conflict versus field collision (§6.2).                          |
| 3       | `childActor` — the child as a matchable actor, deliberately kept out of the shared registry so `LinkedText` never linkifies "you".                               |
| 4       | Almost none, by design. Carried two cross-cutting items instead: §7's two-overrides line, and the optional per-chapter `epilogue`.                               |
| 5       | The authority rule and the election; `decider`; closing the book; and the general `variantOutcomes` mechanism that went on to carry chapters 6 and 7.            |
| 6       | `LogEntry.kind` and `keyMoments` for the replay; `Holder` / `Separation` for the three jobs. No new outcome machinery — chapter 5's carried it.                  |
| 7       | The amendment path and its four behaviours, including the delayed change. `replaceRule` moved here and was hardened so a rewrite cannot change a rule's subject. |

## How they depend on one another

Three things flow forward, and all three landed in the order this page predicted when it was still a plan:

| Introduced in            | What                                                   | Consumed by                                                                             |
| ------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Chapter 5                | the **authority rule** (who decides), and the election | Chapter 6 staffs the three jobs against it; chapter 7's finale shows who holds each one |
| Chapter 5 (book closing) | the **amendment rule**, written behind a veil          | Chapter 7 branches entirely on it                                                       |
| Chapter 6                | `LogEntry.kind` — _how_ each situation was resolved    | Chapter 6's own opening, which replays three of the child's moments by name             |

One design question came out of this and had to be settled by hand: losing chapter 5's election sets `decider: "other"` permanently, and chapter 6 then asks the child to staff three jobs. **Settled: staffing is the village's act, not the decider's** — appointing who guards the book is constitutional rather than day-to-day, so a child who lost still assigns the jobs, and is told why.

## Cross-cutting work, all done

- ~~**§7's "two overrides" line.**~~ Built with chapter 4: `saysOverrideNote()` and `sawOverrideNote`. Said beside the outcome of the child's _second_ override, once ever — one override is a hard case, two is a pattern, and the village only names a pattern.
- ~~**Per-chapter epilogue.**~~ Built with chapter 4: an optional `epilogue` on the `Chapter` type, rendered by `ChapterEnd`. Chapters 1–3 have none.
- ~~**The book closes at the end of chapter 5** (§10).~~ `closeBook()` sets `bookClosed`, and `canWriteRules()` collapses any later write-rule prompt to no-rule. Chapters 6 and 7 invite nothing, and a test says so.
- ~~**`things` and `confidence` were never pinched.**~~ Both now are — `things` across chapters 3–6, and `confidence` at c7s1, which was the last §7 gap. A test checks the whole game for that class of gap rather than trusting anyone to remember.
- ~~**Save state.**~~ The game saves after every situation and offers to resume. Nothing half-decided is kept.
- ~~**Test coverage, and a threshold.**~~ Every component has tests, `page.tsx` is played through its own screens, and thresholds are enforced in `vitest.config.ts`.
- ~~**Transliterated identifiers.**~~ Subjects, groups and protections were Hebrew words spelled in Latin letters (`mayim`, `vatikim`, `kinyan`). They are English now; only the characters keep their names.

## What is deliberately not here

Out of scope for this version (§11): a language model at runtime, multiplayer, voice narration, a free-text rule editor, an election campaign with promises, and opening the rule builder past four options in any field. The last is a content law rather than a preference — a fifth option may only be added alongside a situation that pinches it.
