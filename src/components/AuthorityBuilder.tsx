"use client";

import { useState } from "react";

import { useLanguage } from "@/content/language";
import { authorityOptions, groupLabel, whoOptions } from "@/engine/options";
import { GROUPS } from "@/engine/rights";
import type {
  AuthorityForm,
  AuthorityRule,
  GroupId,
  WhoScope,
} from "@/engine/types";

/**
 * The one place the child writes who decides (§9.5).
 *
 * Two fields, like the rule builder but a different structure: the shape
 * authority takes, and who the rule reaches. The second field is not
 * decoration — if the child picks "the village chooses", it is also the field
 * that decides who votes, which is how this chapter hooks back to §6's
 * question about the passers-through. The note under it says so plainly,
 * because §2 forbids making that a trick.
 */
export default function AuthorityBuilder({
  onWrite,
  onSkip,
}: {
  onWrite: (authority: AuthorityRule) => void;
  onSkip: () => void;
}) {
  const { lang, t } = useLanguage();
  const [form, setForm] = useState<AuthorityForm | null>(null);
  const [scope, setScope] = useState<WhoScope | null>(null);
  const [group, setGroup] = useState<GroupId | null>(null);

  const needsGroup = scope === "group" || scope === "everyone-except";
  const complete = form !== null && scope !== null && (!needsGroup || group);

  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed">{t("authority.intro")}</p>

      <fieldset className="border-t border-moss pt-3">
        <legend className="px-2 text-sm text-quiet">
          {t("authority.legend_form")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {authorityOptions(lang).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setForm(o.value)}
              aria-pressed={o.value === form}
              className={`rounded-sm px-3 py-2 text-start text-[0.95rem] transition-colors ${
                o.value === form
                  ? "bg-lamp text-night"
                  : "bg-dusk text-paper hover:bg-moss"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-moss pt-3">
        <legend className="px-2 text-sm text-quiet">
          {t("authority.legend_who")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {whoOptions(lang).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setScope(o.value);
                if (o.value !== "group" && o.value !== "everyone-except") {
                  setGroup(null);
                }
              }}
              aria-pressed={o.value === scope}
              className={`rounded-sm px-3 py-2 text-start text-[0.95rem] transition-colors ${
                o.value === scope
                  ? "bg-lamp text-night"
                  : "bg-dusk text-paper hover:bg-moss"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-quiet">{t("authority.who_note")}</p>
      </fieldset>

      {needsGroup ? (
        <fieldset className="border-t border-moss pt-3">
          <legend className="px-2 text-sm text-quiet">
            {t("builder.legend_group")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                aria-pressed={g === group}
                className={`rounded-sm px-3 py-2 text-start text-[0.95rem] transition-colors ${
                  g === group
                    ? "bg-lamp text-night"
                    : "bg-dusk text-paper hover:bg-moss"
                }`}
              >
                {groupLabel(lang)[g]}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {complete ? (
          <button
            type="button"
            onClick={() =>
              onWrite({
                form: form!,
                who: { scope: scope!, group: needsGroup ? group! : undefined },
              })
            }
            className="rounded-sm bg-lamp px-5 py-2.5 text-night"
          >
            {t("authority.write")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSkip}
          className="rounded-sm border border-moss px-5 py-2.5 text-paper hover:bg-dusk"
        >
          {t("authority.skip")}
        </button>
      </div>
    </div>
  );
}
