"use client";

import { useLanguage } from "@/content/language";
import { groupLabel } from "@/engine/options";
import { GROUPS } from "@/engine/rights";
import type { Election, GroupId } from "@/engine/types";

/**
 * One round of voting, shown as names and nothing else.
 *
 * No counts, no percentages, no bar: §7's rule that trust is never a number
 * holds here too. The child sees which groups came to them and which went
 * elsewhere, which is exactly the information they have been accumulating,
 * unknowingly, since chapter 1.
 *
 * Groups the WHO field left out are listed separately — that is the chapter
 * hooking back to §6, and it should be visible rather than inferred.
 */
function Column({
  label,
  groups,
  labels,
  empty,
}: {
  label: string;
  groups: GroupId[];
  labels: Record<GroupId, string>;
  empty: string;
}) {
  return (
    <div>
      <h4 className="text-sm font-ui text-ink/50">{label}</h4>
      <p className="mt-1 font-book text-[1.05rem] leading-relaxed">
        {groups.length > 0 ? groups.map((g) => labels[g]).join(", ") : empty}
      </p>
    </div>
  );
}

export default function ElectionResult({ election }: { election: Election }) {
  const { lang, t } = useLanguage();
  const labels = groupLabel(lang);
  const empty = t("election.none");

  const excluded = GROUPS.filter((g) => !election.eligible.includes(g));

  return (
    <div className="settle rounded-sm bg-paper p-6 text-ink">
      <h3 className="font-book text-2xl">{t("election.heading")}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">
        {t("election.intro")}
      </p>

      <div className="mt-6 space-y-4">
        <Column
          label={t("election.for")}
          groups={election.votedFor}
          labels={labels}
          empty={empty}
        />
        <Column
          label={t("election.against")}
          groups={election.votedAgainst}
          labels={labels}
          empty={empty}
        />
        <Column
          label={t("election.abstained")}
          groups={election.abstained}
          labels={labels}
          empty={empty}
        />
      </div>

      {excluded.length > 0 ? (
        <p className="mt-6 border-t border-ink/15 pt-4 text-sm leading-relaxed text-ink/60">
          {t("election.excluded", {
            groups: excluded.map((g) => labels[g]).join(", "),
          })}
        </p>
      ) : null}

      <p className="mt-6 border-t border-ink/15 pt-4 font-book text-[1.15rem] leading-relaxed">
        {election.won ? t("election.won") : t("election.lost")}
      </p>
    </div>
  );
}
