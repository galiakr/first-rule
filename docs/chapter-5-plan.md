# Chapter 5 — "מי מחליט מי מחליט" (Who Decides Who Decides)

> Status: **built**. It was the heaviest chapter; 6 and 7 follow (see `roadmap.md`).

## Context

Design doc §9.5: someone else starts ruling, and the child has nothing to point to that says it's _their_ job — because it never was (§4: nobody appointed them). The only way to settle it is to write a rule about who decides, and that rule applies to the child too. One of its options is elections; the child can lose, and losing is real: the game continues with someone else applying the rules the child wrote. Fence (§9): one voting round, no campaign, no promises.

Then §10: at the end of this chapter the book **closes**. The village reads the rules aloud with two lists (who they protect, who they leave out — `ChapterEnd` already shows exactly these), the child may change one rule, and then writes one last rule behind a veil: **how a rule may be changed.** Chapter 7 is built on it.

Two new mechanics, one ceremony. This is the chapter where the hidden trust number finally does something.

## Key design decisions

1. **The authority rule is a second, separate builder — not a fifth option in the 4×4.** §11 forbids opening the rule builder past four per field; the authority rule is a different structure the design lists with five forms (_אני מחליט · מי שהכי ותיק · שניים יחד · כל אחד לעצמו · הכפר בוחר_). Model it as `AuthorityRule = { form: AuthorityForm; who: RuleWho }`, reusing `WHO_OPTIONS` for the second field — because §9 says who _votes_ is determined by that WHO field, which is how the chapter hooks back into the passers-through question.
2. **The election is decided by trust, deterministically.** Eligible groups = those covered by the authority rule's WHO scope (`residents` → all but `passers-through`, etc.). Each eligible group casts one vote: `comes-to-you` → for the child, `stops-coming` → against, `comes-but` → abstains. The child keeps the role if for > against; otherwise loses. No randomness — every vote traces to a trust level the child earned or burned, which is the whole point. **Open: tie-breaking** (incumbent keeps? lean yes) and whether `comes-but` should count against.
3. **Losing means the child stops deciding, not that the game stops.** New `GameState.decider: "you" | "other"`. When `"other"`: `rule-applies` prompts lose their override button (the other authority applies the child's rules literally), and `write-rule` prompts collapse to `no-rule` (the child can't legislate). The child watches their own rules applied to them by someone else — §9's exact sentence. Cheapest faithful reading; the rival is יותם (`old-timers`, "were here first"), who is also what _מי שהכי ותיק_ resolves to.
4. **"Two together" = the child and the most senior.** No character picker; keeps the builder to two fields.
5. **The book closing is a ChapterEnd variant, not a new phase.** `ChapterEnd` already reads the rules and the two lists. For Chapter 5 it additionally (a) lets the child change exactly one rule — reopen `RuleBuilder` on a chosen rule, replacing it via a new `replaceRule()` — and (b) then asks for the amendment rule: a third small builder with the four forms from §10 (_מי שכתב אותו · שניים צריכים להסכים · כל הכפר · אי אפשר לשנות_). Stored as `GameState.amendment`. Written before the child knows what Chapter 7 will do with it — the doc is explicit that this veil is the point, so the UI must not hint.

## Content

| id   | role                                                                          | invitesRule        | notes                                                                                                                                                                                                                                         |
| ---- | ----------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c5s1 | יותם rules on a dispute (path) without the child; the child hears afterwards  | false              | trust-flavoured: the group that went to him instead. Nothing in the book says who decides                                                                                                                                                     |
| c5s2 | a second self-appointed ruling (dana, on water) contradicts יותם's — pressure | **authority rule** | this is where the authority builder appears instead of `RuleBuilder`                                                                                                                                                                          |
| c5s3 | the authority rule bites, per form                                            | false              | _I decide_ → a character asks who decided _that_; _most senior_ → יותם rules against the child's own preference; _two together_ → יותם won't agree; _each for themselves_ → someone gets hurt; _village chooses_ → **the election runs here** |
| c5s4 | living with it                                                                | false              | if lost: a rule the child wrote is applied to them by יותם, no override offered; if kept: their authority is now formal — and whoever the WHO field excluded (`passers-through`, if `residents`) can't appeal                                 |

Then the book-closing ceremony.

## Data model

```ts
export type AuthorityForm =
  "you" | "most-senior" | "two-together" | "each-alone" | "village-chooses";
export interface AuthorityRule {
  form: AuthorityForm;
  who: RuleWho;
}
export type AmendmentForm = "author" | "two-agree" | "whole-village" | "cannot";
export interface Election {
  eligible: GroupId[];
  for: GroupId[];
  against: GroupId[];
  won: boolean;
}

// GameState additions
authority: AuthorityRule | null;
election: Election | null;
decider: "you" | "other";
amendment: AmendmentForm | null;
bookClosed: boolean;
```

## Engine changes

- `src/engine/authority.ts` (new, pure): `eligibleGroups(who)`, `runElection(state, who): Election`, `setAuthority(state, rule): GameState` (runs the election when `form === "village-chooses"` and sets `decider`).
- `game.ts`: `promptFor` respects `decider` (decision #3); `replaceRule(state, ruleId, next)`; `closeBook(state, amendment)`.
- Tests: election math (for/against/abstain, tie), `decider: "other"` removes override and blocks writing, `replaceRule` keeps the book's order and length, `closeBook` sets `bookClosed` and `amendment`.

## UI

- `AuthorityBuilder` (form + WHO), `AmendmentBuilder` (four forms), an election result screen that shows _which groups_ voted which way — no percentages, names only (§7's rule that trust is never a number holds here too).
- `ChapterEnd` for Chapter 5: change-one-rule step, then the amendment step, then the usual continue.
- `RuleBook` shows the authority rule and, after closing, the amendment rule.

## Open questions, as answered in the build

- **A tie keeps the child in place.** `won = for >= against`. Nobody voted them out, and a tie is not a mandate to replace an incumbent; losing should have to be earned the same way the trust behind it was. This makes losing uncommon, which is correct — §9 wants it possible, not typical.
- **`comes-but` abstains**, as leaned. A group that comes but tells you only half of it is present, not persuaded; counting that as opposition would make the vote harsher than the behaviour it represents.
- **_Each for themselves_ keeps `decider: "you"`**, as leaned. The cost is in c5s3's outcome, where nobody decides and the fastest, biggest person simply takes the sheltered spot while שירה is still explaining why she needs it.
- **Phrasing** stayed concrete and first-person (_אני מחליט_, _מי שהכי ותיק מחליט_) rather than abstract. Still the thing most worth watching with a real child, alongside Chapter 2's question.

## What changed in the build

- **`most-senior` hands the role away**, which the plan implied without saying. The most senior person in the village is יותם, not the child, so choosing that form _is_ choosing to stop deciding. It is the one form that loses the role without an election.
- **A general `variantOutcomes` mechanism** rather than anything chapter-5-specific: `outcomeFor(situation, what, overrode, variants)` takes candidate keys, most specific first, and falls back to the WHAT-keyed outcomes. `variantKeys(state)` yields the authority form (with the election folded in), then `authority-written`, then `you-decide`/`other-decides`. Chapter 6 can reuse this for its three jobs without touching the engine again.
- **Winning and losing the same vote are separate variants** (`village-chooses-won` / `village-chooses-lost`). They are different things to live through and deserved different prose.
- **The authority builder has a skip.** Everything else in the game lets the child decline, and c5s2's "you wrote nothing" outcome — the village quietly learning which of the two rulers to go to for the answer they want — is too good to make unreachable.
- **A playthrough caught c5s2 still showing "you wrote nothing" after the child had just written the line.** Writing the authority rule settles with `governedBy: null`, so it fell through to `noRuleOutcome`. Fixed with an `authority-written` variant, and pinned by a test. Second chapter running that the eyeball playthrough caught a content bug the type system could not.
- **The ceremony is its own phase** (`"closing"`), not a `ChapterEnd` variant as the plan guessed. It runs between the last situation and the chapter-end screen: the book is read aloud, one rule may be changed, the amendment rule is written, and only then does the rights board appear. `BookClosing` deliberately says nothing about why the amendment rule might matter later — §10's veil is the point.

## Carried forward

Losing the election persists into chapters 6–7, which are not built yet. Chapter 6 asks the child to staff three jobs; what that means for a child who no longer decides is an open question for that chapter, noted in `roadmap.md`.
