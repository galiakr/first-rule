import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import Page from "@/app/page";
import { chapters } from "@/content/situations";
import { DEFAULT_LANG, translator } from "@/content/tokens";
import { renderWithLanguage } from "@/test/render";

/**
 * The whole game, driven through its own screens.
 *
 * `page.tsx` is where the engine, the content and every panel meet, and it is
 * the one file a unit test of any single part cannot reach. These play the
 * opening chapter the way a child would — naming the village, answering a
 * situation, watching the outcome accumulate — so the wiring is checked
 * rather than assumed.
 */

const t = translator(DEFAULT_LANG);
const CH1 = chapters(DEFAULT_LANG)[0];

/** Names a village and steps into the first situation. */
async function enterVillage(user: ReturnType<typeof userEvent.setup>) {
  renderWithLanguage(<Page />);
  await user.type(screen.getByLabelText(t("about.name_prompt")), "עין חרוד");
  await user.click(
    screen.getByRole("button", { name: t("about.enter_village") }),
  );
  await user.click(
    screen.getByRole("button", { name: t("app.intro_continue") }),
  );
}

describe("playing the game through its own screens", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("opens on the village, then the chapter, then the first situation", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<Page />);

    expect(
      screen.getByRole("heading", { name: t("about.title") }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: t("about.enter_village") }),
    );
    expect(screen.getByRole("heading", { name: CH1.title })).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: t("app.intro_continue") }),
    );
    expect(
      screen.getByRole("heading", { name: CH1.situations[0].title }),
    ).toBeVisible();
  });

  it("shows the village's name and how far in the child is", async () => {
    const user = userEvent.setup();
    await enterVillage(user);

    expect(screen.getByText("עין חרוד")).toBeVisible();
    expect(
      screen.getByText(
        t("app.chapter_progress", { chapter: 1, n: 1, total: 4 }),
      ),
    ).toBeVisible();
  });

  it("stacks scene, decision, outcome and lesson on one screen", async () => {
    const user = userEvent.setup();
    await enterVillage(user);
    const scene = screen.getByRole("heading", {
      name: CH1.situations[0].title,
    });

    await user.click(screen.getByRole("button", { name: t("builder.skip") }));
    expect(scene).toBeVisible();
    expect(screen.getByText(`✓ ${t("builder.skip")}`)).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: t("app.outcome.continue") }),
    );
    // The scene and the decision are both still there behind the lesson.
    expect(scene).toBeVisible();
    expect(screen.getByText(`✓ ${t("builder.skip")}`)).toBeVisible();
    expect(screen.getByText(CH1.situations[0].lesson)).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: t("app.lesson.next") }),
    );
    expect(
      screen.getByRole("heading", { name: CH1.situations[1].title }),
    ).toBeVisible();
  });

  it("writes a rule into the book, where it can be read back", async () => {
    const user = userEvent.setup();
    await enterVillage(user);

    await user.click(
      screen.getByRole("button", { name: t("builder.who.residents.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.what.ask_first.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.when.always.label") }),
    );
    await user.click(
      screen.getByRole("button", {
        name: t("builder.consequence.return_or_fix.label"),
      }),
    );
    await user.click(screen.getByRole("button", { name: t("builder.write") }));

    expect(screen.getByText(`✓ ${t("builder.write")}`)).toBeVisible();

    // The header counts it, and the book holds it.
    await user.click(
      screen.getByRole("button", { name: `${t("app.rulebook_button")} (1)` }),
    );
    const book = screen.getByRole("dialog", { name: t("app.rulebook_button") });
    expect(
      within(book).getByText(t("rulebook.rule_number", { n: 1 })),
    ).toBeVisible();
  });

  it("applies a rule the child wrote, and lets them go against it", async () => {
    const user = userEvent.setup();
    await enterVillage(user);

    // Write a water rule at the first situation…
    await user.click(
      screen.getByRole("button", { name: t("builder.who.residents.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.what.forbidden.label") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("builder.when.always.label") }),
    );
    await user.click(
      screen.getByRole("button", {
        name: t("builder.consequence.return_or_fix.label"),
      }),
    );
    await user.click(screen.getByRole("button", { name: t("builder.write") }));
    await user.click(
      screen.getByRole("button", { name: t("app.outcome.continue") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("app.lesson.next") }),
    );

    // …skip the path situation, and it comes back at the third, on Shira.
    await user.click(screen.getByRole("button", { name: t("builder.skip") }));
    await user.click(
      screen.getByRole("button", { name: t("app.outcome.continue") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("app.lesson.next") }),
    );

    expect(screen.getByText(t("app.decide.rule_applies_intro"))).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: t("app.decide.override_rule") }),
    );
    expect(
      screen.getByText(`✓ ${t("app.decide.override_rule")}`),
    ).toBeVisible();
  });

  it("opens the contents and the notebook without losing your place", async () => {
    const user = userEvent.setup();
    await enterVillage(user);

    await user.click(screen.getByRole("button", { name: t("app.toc_button") }));
    const toc = screen.getByRole("dialog", { name: t("app.toc_button") });
    await user.click(
      within(toc).getByRole("button", { name: t("common.close") }),
    );

    await user.click(
      screen.getByRole("button", { name: t("app.notes_button") }),
    );
    const notes = screen.getByRole("dialog", { name: t("notes.heading") });
    // Nothing is earned yet, and the notebook says so.
    expect(within(notes).getByText(t("notes.empty"))).toBeVisible();
    await user.click(
      within(notes).getByRole("button", { name: t("common.close") }),
    );

    expect(
      screen.getByRole("heading", { name: CH1.situations[0].title }),
    ).toBeVisible();
  });

  it("switches language mid-situation without losing the game", async () => {
    const user = userEvent.setup();
    await enterVillage(user);

    await user.click(screen.getByRole("button", { name: "English" }));

    const inEnglish = chapters("en")[0];
    expect(
      screen.getByRole("heading", { name: inEnglish.situations[0].title }),
    ).toBeVisible();
    // Still the same village, still the first situation.
    expect(screen.getByText("עין חרוד")).toBeVisible();
  });

  it("saves after a situation, so the village is there next time", async () => {
    const user = userEvent.setup();
    await enterVillage(user);
    await user.click(screen.getByRole("button", { name: t("builder.skip") }));
    await user.click(
      screen.getByRole("button", { name: t("app.outcome.continue") }),
    );
    await user.click(
      screen.getByRole("button", { name: t("app.lesson.next") }),
    );

    const raw = window.localStorage.getItem("first-rule:save");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).villageName).toBe("עין חרוד");
    expect(JSON.parse(raw!).index).toBe(1);
  });
});
