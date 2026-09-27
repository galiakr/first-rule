"use client";

import { useLanguage } from "@/content/language";
import { LANGUAGES, LANG_LABEL } from "@/content/tokens";

/**
 * Switches the language in place. The game state lives above this in page.tsx
 * and isn't touched, so the child keeps their rules, precedents and position
 * — only the words change.
 *
 * Each language is written in itself ("עברית", "English"), so the one you
 * want is readable even when the interface currently isn't.
 */
export default function LanguageSwitcher({
  tone = "dark",
}: {
  /** "light" for the entry screen's daylight ground; "dark" inside the game. */
  tone?: "light" | "dark";
}) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("app.language_label")}
      className="flex items-baseline gap-2"
    >
      {LANGUAGES.map((option) => {
        const current = option === lang;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            onClick={() => setLang(option)}
            aria-pressed={current}
            className={`text-sm underline underline-offset-4 ${
              tone === "light"
                ? current
                  ? "text-act"
                  : "text-inksoft hover:text-inkdeep"
                : current
                  ? "text-lamp"
                  : "text-quiet hover:text-paper"
            }`}
          >
            {LANG_LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}
