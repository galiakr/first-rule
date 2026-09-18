# Chapter 3 — "הכלל שלך נגדך" (Your Rule Against You)

> Status: built, matching this plan as written (unlike `chapter-1-plan.md`, which is a retrospective written after the fact).

## Context

Chapters 1–2 are built (`docs/chapter-1-plan.md`, `docs/chapter-2-plan.md`). Chapter 3 has far less spec than Chapter 2 did — design doc §9.3 is one line: _"this time the rule applies to the child themselves, or to a character they like."_ No dedicated subsection like precedents got in §6.1. That's a real signal, not a gap: Chapter 3 introduces **no new engine mechanic**. Its entire job is to point the _existing_ rule/precedent machinery at two new kinds of target — the child, and a character the child is already fond of — and let situations 1–2 (already-established water/path rules) do the pinching.

The one real engineering question this surfaces: **the engine has no way to represent "the child" as an `Actor` today**, and `whoCovers()`/`ruleApplies()` require one (`actors[situation.actorId]`). Working out how to add that without breaking anything else is most of this plan.

## The child-as-actor problem, and why the obvious approach breaks something

`ruleApplies()` looks up `actors[situation.actorId]` and calls `whoCovers(rule, actor)` — so making a rule apply "to the child" requires an actual `Actor` record for them, with `resident`/`groups` set correctly.

The obvious move — add `you: { id: "you", name: "אתה", groups: [], resident: true }` to the existing `ACTORS` record in `src/content/village.ts` — **breaks `LinkedText`**. That component (built for the character-hover feature) does `Object.values(ACTORS)` and turns every substring match of an actor's `name` in any prose into a hoverable tooltip. "אתה" (you) is one of the most common words in Hebrew and appears constantly in second-person narration throughout _every_ situation, lesson, and outcome in the game. Adding it to `ACTORS` would make `LinkedText` linkify huge swaths of unrelated text.

**Resolution:** keep the child as a separate export, never merged into `ACTORS`:

```ts
// src/content/village.ts
export const CHILD_ACTOR: Actor = {
  id: "you",
  name: t("common.you"), // "אתה" — intentionally not in ACTORS, so LinkedText never sees it
  groups: [], // no group — matches §4: no title, no group appointed
  resident: true,
};
```

`LinkedText` imports `ACTORS` directly and stays untouched — it will simply never encounter `CHILD_ACTOR`, which is also correct on its own terms (a hover tooltip explaining "you" to the child is pointless). The only place that needs the child visible for matching is the one `promptFor` call site in `page.tsx`, which changes from passing `ACTORS` to passing `{ ...ACTORS, you: CHILD_ACTOR }`.

**Bonus: this isn't just a workaround, it produces the right gameplay for free.** Walking through `whoCovers()` with `groups: []`:

- `residents` → covers the child (they live there) — a rule scoped this way silently includes them, probably without the child having thought about it when writing it.
- `anyone-present` → always covers them.
- `group: X` → never covers them (they belong to no group) — a group-scoped rule can never reach them directly.
- `everyone-except: X` → **always** covers them, regardless of which group X is — they can never be the excluded group, because they're not in _any_ group.

That last one is a sharp, emergent "gotcha" that lands exactly on-theme, and it costs zero new code — it falls straight out of the existing matching logic once `CHILD_ACTOR` exists.

## Structure: no new rule-writing needed to make the point, one added anyway for the sharper payoff

Unlike Ch1/Ch2, Chapter 3 doesn't need "2 situations invite, 2 collide" — its premise is entirely retrospective. Structure:

| id   | role                                                                 | subject | act                 | actor→victim    | invitesRule |
| ---- | -------------------------------------------------------------------- | ------- | ------------------- | --------------- | ----------- |
| c3s1 | self-pinch on the Ch1 water rule                                     | mayim   | took-without-asking | **you**→yotam   | false       |
| c3s2 | beloved-character pinch on the Ch1 path rule                         | shvil   | blocked             | shira→**barak** | false       |
| c3s3 | fresh case, explicitly flagged: you'll be affected by what you write | chefetz | refused-to-share    | barak→dana      | true        |
| c3s4 | c3s3's rule, reapplied to the child directly — closes the chapter    | chefetz | refused-to-share    | **you**→michal  | false       |

Notes on choices:

- **c3s1** reuses the Ch1 `mayim` rule via plain `ruleApplies` — no new mechanism. If the child never wrote a water rule (skipped it at c1s1), `noRuleOutcome` carries its own lesson ("you have nothing to go by here either — same as everyone did before there were rules").
- **c3s2** deliberately makes **ברק** the victim this time, not שירה — a small structural inversion (he was the one the path rule originally measured; now it measures someone else, and he's the one waiting) that keeps this from feeling like a straight repeat of c1s2/c1s4. `forbidden`'s outcome strains **`halich`** (fair process / hearing both sides) for `yeladim` — the only one of the six protections still unused after Chapters 1–2. Thematically exact: "the rule didn't ask her why, it only checked whether she lives here."
- **c3s3/c3s4** use `refused-to-share`, the other still-unused `ActKind` (Ch1/Ch2 have used `took-without-asking`, `blocked`, `told-what-was-private`; `broke` stays open for a later chapter). c3s3's scene text and lesson name the stakes honestly up front ("you use the village's shared things too — think about that as you write this one") — informative, not a trick, matching §2's "never says you were wrong" rule. c3s4 then reapplies whatever the child wrote, this time with the child as the one being refused or required to share.
- Chapter-closing lesson at c3s4 states the theme in words only now that it's been felt twice, per §2: _"כלל שלא חל עליך הוא בקשה. כלל שחל גם עליך הוא הבטחה."_ ("A rule that doesn't apply to you is a request. A rule that also applies to you is a promise.")
- No new `Subject` values needed (all five are already in play); chapter budget stays inside the existing 4-situation shape.

## Engine changes (small, on purpose)

- `src/content/village.ts`: add `CHILD_ACTOR` (as above). Add token `common.you` = "אתה".
- `src/app/page.tsx`: the one `promptFor(state, situation, ACTORS, SITUATIONS_BY_ID)` call becomes `promptFor(state, situation, { ...ACTORS, you: CHILD_ACTOR }, SITUATIONS_BY_ID)`.
- **Nothing else in the engine changes** — no new `Prompt` kind, no new `Situation`/`GameState` fields, `match.ts`/`conflict.ts`/`precedent.ts`/`game.ts` untouched. This is a much lighter footprint than Chapter 2, consistent with the one-line design brief.

## Content

- New `src/content/chapter3.ts`, same shape as `chapter1.ts`/`chapter2.ts`, all copy via `t()`.
- Add to `src/content/situations.ts`'s `SITUATIONS_BY_ID` combination and to `page.tsx`'s `CHAPTERS` array (`chapter3.ts`'s title/intro/situations, same pattern as Chapter 2 was added).
- `tokens.csv` grows with `chapter3.*` (title/intro/4 situations × title/text/lesson/outcomes, same field shape as `chapter2.*`) plus `common.you`. Regenerate `locales/*.json` via the existing `generate.py`.

## Testing

Extend `engine.test.ts` (same single-file convention):

- `CHILD_ACTOR` coverage: `whoCovers` returns true for `residents`/`anyone-present`/`everyone-except`, false for any `group` scope.
- **Regression guard**: `CHILD_ACTOR` is never present in `Object.values(ACTORS)` — pins down the exact bug this plan avoided, so nobody re-merges it in later.
- "chapter 3 content holds up": 4 situations, every situation has outcomes for all four WHAT clauses.
- Playthrough test: with a `mayim` rule written at c1s1-equivalent state, c3s1 resolves via `rule-applies` against `CHILD_ACTOR`; without one, it falls through to `no-rule`.
- Playthrough test: c3s3 → write a `chefetz` rule scoped `everyone-except` a group → c3s4 confirms it still reaches the child (the emergent case called out above).

## Verification

1. `npx tsc --noEmit`, `npm run lint`, `npm test`
2. `npm run build`
3. Manual run-through via `npm run dev`: play through to Chapter 3, confirm c3s1 reacts correctly whether or not a water rule exists, confirm `LinkedText` still never highlights "אתה" anywhere on the page, open the rule book to confirm nothing about `CHILD_ACTOR` leaks into it (it shouldn't — rules/precedents are stored independent of actor identity)
