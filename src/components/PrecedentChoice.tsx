"use client";

import { t } from "@/content/tokens";
import type { PrecedentOption, Situation, TraitKey } from "@/engine/types";

interface Props {
  source: Situation;
  situation: Situation;
  options: PrecedentOption[];
  onPick: (traits: TraitKey[]) => void;
}

/**
 * The one-time "what determined it?" moment (design doc §6.1). Shows the two
 * cases side by side and asks the child to pick — not among abstract trait
 * names, but among full sentences authored per precedent.
 */
export default function PrecedentChoice({
  source,
  situation,
  options,
  onPick,
}: Props) {
  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed">{t("precedent.choice_intro")}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-sm bg-paper p-4 text-ink">
          <p className="mb-1 text-xs text-ink/50">
            {t("precedent.choice_source_label")}
          </p>
          <p className="font-book text-[1.05rem] leading-relaxed">
            {source.title}
          </p>
        </div>
        <div className="rounded-sm bg-paper p-4 text-ink">
          <p className="mb-1 text-xs text-ink/50">
            {t("precedent.choice_new_label")}
          </p>
          <p className="font-book text-[1.05rem] leading-relaxed">
            {situation.title}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(option.traits)}
            className="block w-full rounded-sm bg-dusk p-4 text-right text-[0.95rem] text-paper hover:bg-moss"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
