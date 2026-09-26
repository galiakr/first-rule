"use client";

import { useLanguage } from "@/content/language";
import type { KeyMoment, Situation } from "@/engine/types";

/**
 * Three moments out of the child's own game, each given a name (§9.6).
 *
 * Nothing here is authored per-child: the moments come from the log, and the
 * only thing the game adds is the word for what they were doing. The design
 * doc calls this the strongest teaching moment in the game, and it costs
 * almost no new content — the content is the player's own history.
 *
 * A job the child never once did says so plainly rather than substituting a
 * different moment. §2 forbids telling the child something about themselves
 * that isn't true, and "you never once did this" is itself worth reading.
 */
export default function KeyMoments({
  moments,
  situationsById,
  onContinue,
}: {
  moments: KeyMoment[];
  situationsById: Record<string, Situation>;
  onContinue: () => void;
}) {
  const { t } = useLanguage();

  return (
    <section className="settle space-y-8">
      <header className="space-y-3">
        <h2 className="font-book text-3xl leading-tight">
          {t("moments.heading")}
        </h2>
        <p className="text-lg leading-relaxed">{t("moments.intro")}</p>
      </header>

      <ol className="space-y-4">
        {moments.map((moment) => {
          const situation = moment.situationId
            ? situationsById[moment.situationId]
            : null;
          return (
            <li key={moment.job} className="rounded-sm bg-paper p-5 text-ink">
              <p className="text-xs font-ui text-ink/50">
                {t(`moments.${moment.job}.name`)}
              </p>
              <p className="mt-2 font-book text-[1.15rem] leading-relaxed">
                {situation
                  ? t(`moments.${moment.job}.what`, { title: situation.title })
                  : t("moments.never")}
              </p>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={onContinue}
        className="rounded-sm bg-lamp px-5 py-2.5 text-night"
      >
        {t("moments.continue")}
      </button>
    </section>
  );
}
