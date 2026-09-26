import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import RuleBook from "@/components/RuleBook";
import { chapter1 } from "@/content/chapter1";
import { chapterNotes } from "@/content/notes";
import { situationsById } from "@/content/situations";
import he from "@/content/tokens/locales/he.json";
import {
  DEFAULT_LANG,
  LANGUAGES,
  LANG_DIR,
  isLang,
  perLanguage,
  translator,
} from "@/content/tokens";
import { actors, childActor, groupBlurb } from "@/content/village";
import { initialState } from "@/engine/game";
import { ruleSentence } from "@/engine/match";
import { groupLabel, subjectForms, whatOptions } from "@/engine/options";
import { protectionLabel } from "@/engine/rights";
import type { Rule } from "@/engine/types";
import { renderWithLanguage } from "@/test/render";

const RULE: Rule = {
  id: "r",
  who: { scope: "residents" },
  what: "ask-first",
  when: "always",
  consequence: "return-or-fix",
  subject: "water",
  writtenAt: "c1s1",
};

describe("translator", () => {
  it("returns the string for the asked-for language", () => {
    expect(translator("he")("app.title")).toBe("כלל ראשון");
    expect(translator("en")("app.title")).toBe("First Rule");
  });

  it("fills placeholders in both languages", () => {
    expect(translator("he")("rulebook.rule_number", { n: 2 })).toContain("2");
    expect(translator("en")("rulebook.rule_number", { n: 2 })).toBe("Rule 2");
  });

  it("falls back to the default language rather than showing nothing", () => {
    // A key that exists only in Hebrew would otherwise render blank in English.
    expect(translator("en")("nope.not.a.key")).toBe("nope.not.a.key");
  });

  it("recognises only the languages it ships", () => {
    expect(isLang("he")).toBe(true);
    expect(isLang("en")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang(null)).toBe(false);
  });
});

describe("every language is fully translated", () => {
  it("has no key that falls through to its own name", () => {
    // Walk the Hebrew tree and check the same key resolves in every language.
    const missing: string[] = [];
    const walk = (node: unknown, path: string[]) => {
      if (typeof node === "string") {
        const key = path.join(".");
        for (const lang of LANGUAGES) {
          if (translator(lang)(key) === key) missing.push(`${lang}:${key}`);
        }
        return;
      }
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) walk(v, [...path, k]);
      }
    };
    // he is the complete locale by definition, so it is the key list.
    walk(he, []);
    expect(missing).toEqual([]);
  });

  it("writes Hebrew right to left and English left to right", () => {
    expect(LANG_DIR.he).toBe("rtl");
    expect(LANG_DIR.en).toBe("ltr");
  });
});

describe("content is rebuilt per language", () => {
  it("gives the same situation different prose in each language", () => {
    const he = chapter1("he");
    const en = chapter1("en");
    expect(he.title).not.toBe(en.title);
    expect(en.title).toBe("No Rules");
    // Same structure, different words — ids and fields must not drift.
    expect(he.situations.map((s) => s.id)).toEqual(
      en.situations.map((s) => s.id),
    );
    expect(he.situations[0].subject).toBe(en.situations[0].subject);
  });

  it("translates the characters, so prose and tooltips agree", () => {
    expect(actors("he").yotam.name).toBe("יותם");
    expect(actors("en").yotam.name).toBe("Yotam");
    // The English scene text has to use the English name or LinkedText,
    // which matches on the name, would never find it.
    expect(chapter1("en").situations[0].text).toContain("Yotam");
  });

  it("keeps the child out of the shared registry in every language", () => {
    for (const lang of LANGUAGES) {
      expect(Object.values(actors(lang))).not.toContain(childActor(lang));
      expect(Object.keys(actors(lang))).not.toContain("you");
    }
    expect(childActor("en").name).toBe("you");
  });

  it("translates groups, protections, notes and situation lookups", () => {
    expect(groupLabel("en")["passers-through"]).toBe("the passers-through");
    expect(groupBlurb("en").children).toBe("nobody asks them");
    expect(protectionLabel("en").property).toBe("property");
    expect(chapterNotes("en")[0].concept).toBe(
      "A rule is a decision made in advance",
    );
    expect(Object.keys(situationsById("en"))).toEqual(
      Object.keys(situationsById("he")),
    );
  });

  it("hands back the identical object for the same language", () => {
    // Memoized, so these are safe as useMemo dependencies and React keys.
    expect(chapter1("he")).toBe(chapter1("he"));
    expect(chapter1("he")).not.toBe(chapter1("en"));
  });

  it("builds each language only once", () => {
    let builds = 0;
    const build = perLanguage(() => {
      builds += 1;
      return {};
    });
    build("he");
    build("he");
    build("en");
    expect(builds).toBe(2);
  });
});

describe("the rule sentence composes in both languages", () => {
  it("reads as one sentence in each, with no placeholder left", () => {
    const he = ruleSentence(RULE, "he");
    const en = ruleSentence(RULE, "en");
    expect(he).toBe(
      "מי שגר בכפר לא ייקח את המים בלי לבקש, תמיד. אם לא — יצטרך להחזיר או לתקן.",
    );
    expect(en).toBe(
      "Whoever lives in the village must not take the water without asking, always. If not — they have to give it back or fix it.",
    );
  });

  it("leaves no placeholder unfilled for any combination, in any language", () => {
    for (const lang of LANGUAGES) {
      for (const who of [
        "residents",
        "anyone-present",
        "group",
        "everyone-except",
      ] as const) {
        for (const what of whatOptions(lang)) {
          const text = ruleSentence(
            {
              ...RULE,
              who: { scope: who, group: "shepherds" },
              what: what.value,
            },
            lang,
          );
          expect(text).not.toContain("{");
        }
      }
    }
  });

  it("gives English one plain noun where Hebrew needs two cases", () => {
    const he = subjectForms("he").water;
    const en = subjectForms("en").water;
    expect(he.et).not.toBe(he.be);
    expect(en.et).toBe(en.be);
  });
});

describe("the switcher", () => {
  it("marks the current language and switches the interface in place", async () => {
    const user = userEvent.setup();
    renderWithLanguage(
      <>
        <LanguageSwitcher />
        <RuleBook
          state={initialState()}
          rules={[RULE]}
          precedents={[]}
          situationsById={{}}
          open
          onClose={() => {}}
        />
      </>,
    );

    const hebrew = screen.getByRole("button", { name: "עברית" });
    const english = screen.getByRole("button", { name: "English" });
    expect(hebrew).toHaveAttribute("aria-pressed", "true");
    expect(english).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(ruleSentence(RULE, DEFAULT_LANG))).toBeVisible();

    await user.click(english);

    expect(english).toHaveAttribute("aria-pressed", "true");
    expect(hebrew).toHaveAttribute("aria-pressed", "false");
    // The rule the child wrote is still there — only the words changed.
    expect(screen.getByText(ruleSentence(RULE, "en"))).toBeVisible();
    expect(
      screen.queryByText(ruleSentence(RULE, "he")),
    ).not.toBeInTheDocument();
  });

  it("remembers the choice for next time", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithLanguage(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: "English" }));
    unmount();

    // A fresh mount reads the stored preference back.
    renderWithLanguage(<LanguageSwitcher />);
    expect(
      await screen.findByRole("button", { name: "English" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("sets lang and dir on the document", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<LanguageSwitcher />);

    expect(document.documentElement.lang).toBe("he");
    expect(document.documentElement.dir).toBe("rtl");

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });
});
