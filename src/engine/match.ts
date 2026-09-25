/**
 * Does a rule the child wrote cover the situation in front of them?
 *
 * Deterministic and total — no similarity scores, no thresholds, no language
 * model. Every answer the game gives traces back to a field the child picked,
 * which is what keeps it from feeling arbitrary (design doc §6).
 */

import { translator } from "@/content/tokens";
import type { Lang } from "@/content/tokens";

import {
  consequenceOptions,
  whatOptions,
  whenOptions,
  whoOptions,
  fill,
  findOption,
} from "./options";
import type { Actor, Rule, Situation } from "./types";

/** Does the rule's WHO field cover this person? */
export function whoCovers(rule: Rule, actor: Actor): boolean {
  switch (rule.who.scope) {
    case "residents":
      return actor.resident;
    case "anyone-present":
      return true;
    case "group":
      return (
        rule.who.group !== undefined && actor.groups.includes(rule.who.group)
      );
    case "everyone-except":
      return (
        rule.who.group !== undefined && !actor.groups.includes(rule.who.group)
      );
  }
}

/** Does the rule's WHEN condition hold in this situation? */
export function whenHolds(rule: Rule, situation: Situation): boolean {
  switch (rule.when) {
    case "always":
      return true;
    case "when-scarce":
      return situation.scarce;
    case "when-harmed":
      return situation.someoneHarmed;
    case "first-time-forgiven":
      // The rule bites from the second time on. A first offence is forgiven.
      return !situation.firstOffence;
  }
}

export function ruleApplies(
  rule: Rule,
  situation: Situation,
  actors: Record<string, Actor>,
): boolean {
  if (rule.subject !== situation.subject) return false;
  const actor = actors[situation.actorId];
  if (!actor) return false;
  return whoCovers(rule, actor) && whenHolds(rule, situation);
}

/**
 * All rules that fire here, in the order they were written.
 * Two or more with incompatible WHAT clauses is a field collision (§6.2).
 */
export function applicableRules(
  rules: Rule[],
  situation: Situation,
  actors: Record<string, Actor>,
): Rule[] {
  return rules.filter((r) => ruleApplies(r, situation, actors));
}

/** The rule as one sentence — this is what the book shows. */
export function ruleSentence(rule: Rule, lang: Lang): string {
  const who = fill(
    findOption(whoOptions(lang), rule.who.scope).template,
    rule.subject,
    lang,
    rule.who.group,
  );
  const what = fill(
    findOption(whatOptions(lang), rule.what).template,
    rule.subject,
    lang,
  );
  const when = fill(
    findOption(whenOptions(lang), rule.when).template,
    rule.subject,
    lang,
  );
  const consequence = fill(
    findOption(consequenceOptions(lang), rule.consequence).template,
    rule.subject,
    lang,
  );

  return translator(lang)("rule.sentence", { who, what, when, consequence });
}
