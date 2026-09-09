"use client";

import { ruleSentence } from "@/engine/match";
import { GROUP_LABEL } from "@/engine/options";
import { GROUPS, PROTECTION_LABEL, STATE_LABEL, harmed } from "@/engine/rights";
import type { GameState } from "@/engine/types";

/**
 * The only place the rights board is shown (§8, §10). Not a score — a list of
 * protections with the group they belong to, broken ones first.
 */
export default function ChapterEnd({ state }: { state: GameState }) {
  const harm = harmed(state.rights);
  const harmedGroups = new Set(harm.map((h) => h.group));
  const untouched = GROUPS.filter((g) => !harmedGroups.has(g));

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-quiet">סוף פרק ראשון</p>
        <h2 className="font-book text-3xl leading-tight">
          הכפר קורא את מה שכתבת
        </h2>
      </header>

      <section className="rounded-sm bg-paper p-6 text-ink">
        {state.rules.length === 0 ? (
          <p className="font-book text-lg leading-relaxed">
            לא נכתב אף כלל. הכפר נשאר בדיוק כמו שהיה, וכל דבר הוכרע מחדש בכל
            פעם.
          </p>
        ) : (
          <ol className="space-y-5">
            {state.rules.map((rule, i) => (
              <li
                key={rule.id}
                className="font-book text-[1.15rem] leading-relaxed"
              >
                <span className="ms-2 text-ink/45">{i + 1}.</span>
                {ruleSentence(rule)}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="font-book text-xl">את מי הכללים האלה השאירו בחוץ</h3>
        {harm.length === 0 ? (
          <p className="text-quiet">אף הגנה לא נשברה ולא נמתחה בפרק הזה.</p>
        ) : (
          <ul className="space-y-2">
            {harm.map((h) => (
              <li
                key={`${h.protection}:${h.group}`}
                className="flex items-baseline gap-3 border-b border-moss pb-2"
              >
                <span
                  className={`text-sm ${
                    h.state === "broken" ? "text-harm" : "text-lamp"
                  }`}
                >
                  {STATE_LABEL[h.state]}
                </span>
                <span className="font-book text-lg">
                  הזכות ל{PROTECTION_LABEL[h.protection]}
                </span>
                <span className="text-quiet">— אצל {GROUP_LABEL[h.group]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {untouched.length > 0 ? (
        <section className="space-y-2">
          <h3 className="font-book text-xl">ואת מי הם הגנו</h3>
          <p className="text-quiet">
            {untouched.map((g) => GROUP_LABEL[g]).join(", ")} יצאו מהפרק הזה עם
            כל ההגנות שלמות.
          </p>
        </section>
      ) : null}

      <p className="max-w-read border-t border-moss pt-6 text-quiet">
        זה הפרק הראשון. הכללים שכתבת נשארים בספר, והם ימשיכו לחול גם בפרקים
        הבאים — גם כשלא יתאים לך.
      </p>
    </div>
  );
}
