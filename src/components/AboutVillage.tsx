import { t } from "@/content/tokens";
import {
  ABOUT_ME_TEXT,
  ABOUT_TITLE,
  ABOUT_VILLAGE_TEXT,
  GROUP_BLURB,
} from "@/content/village";
import { GROUP_LABEL } from "@/engine/options";
import { GROUPS } from "@/engine/rights";

/**
 * The screen before the village opens (§4). Introduces the six groups by
 * what moves them, then says what the child's role is not: appointed by
 * anyone. This is scene-setting, not a lesson — so unlike the concepts in
 * play, it can be said outright before anything is felt.
 */
export default function AboutVillage({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-book text-4xl leading-tight">{ABOUT_TITLE}</h1>
        <p className="text-lg leading-relaxed">{ABOUT_VILLAGE_TEXT}</p>
      </header>

      <ul className="space-y-2">
        {GROUPS.map((g) => (
          <li
            key={g}
            className="flex flex-wrap items-baseline gap-x-3 border-b border-moss pb-2"
          >
            <span className="font-book text-lg">{GROUP_LABEL[g]}</span>
            <span className="text-quiet">— {GROUP_BLURB[g]}</span>
          </li>
        ))}
      </ul>

      <p className="border-r-2 border-lamp ps-1 pe-4 text-lg leading-relaxed">
        {ABOUT_ME_TEXT}
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="rounded-sm bg-lamp px-5 py-2.5 text-night"
      >
        {t("about.enter_village")}
      </button>
    </section>
  );
}
