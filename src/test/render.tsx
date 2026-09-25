import { render } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";

import { LanguageProvider } from "@/content/language";
import { DEFAULT_LANG, translator } from "@/content/tokens";
import type { Lang, Translate } from "@/content/tokens";

/**
 * Renders inside the language provider, which every component that shows text
 * now needs. Returns the matching `t` so a test can assert against the exact
 * string the component was given, in whichever language it asked for.
 *
 * The provider always starts at DEFAULT_LANG, so rendering in another language
 * goes through the switcher the way a player would (see LanguageSwitcher's
 * tests) rather than being injected here.
 */
export function renderWithLanguage(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult & { t: Translate; lang: Lang } {
  const result = render(ui, { wrapper: LanguageProvider, ...options });
  return { ...result, t: translator(DEFAULT_LANG), lang: DEFAULT_LANG };
}
