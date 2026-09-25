import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Notes from "@/components/Notes";
import { chapterNotes } from "@/content/notes";
import { DEFAULT_LANG, translator } from "@/content/tokens";
import { renderWithLanguage } from "@/test/render";

const t = translator(DEFAULT_LANG);
const CHAPTER_NOTES = chapterNotes(DEFAULT_LANG);
const TITLES = ["אין כללים", "זה כבר קרה", "הכלל שלך נגדך"];

function renderNotes(unlocked: number[]) {
  renderWithLanguage(
    <Notes
      notes={CHAPTER_NOTES}
      titles={TITLES}
      unlocked={unlocked}
      open
      onClose={() => {}}
    />,
  );
}

/** The accordion header for a chapter, by its title. */
function header(chapter: number) {
  return screen.getByRole("button", { name: new RegExp(TITLES[chapter - 1]) });
}

describe("Notes", () => {
  it("renders nothing while closed", () => {
    const { container } = renderWithLanguage(
      <Notes
        notes={CHAPTER_NOTES}
        titles={TITLES}
        unlocked={[1]}
        open={false}
        onClose={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("says the notebook is empty before any chapter is finished", () => {
    renderNotes([]);
    expect(screen.getByText(t("notes.empty"))).toBeInTheDocument();
  });

  it("hides a locked chapter's concept and gives it no button to press", () => {
    renderNotes([]);
    // The chapter is listed — the child can see there's something coming —
    // but §2's rule holds: the idea isn't named before it's been felt.
    expect(screen.getByText(TITLES[0], { exact: false })).toBeInTheDocument();
    expect(
      screen.queryByText(CHAPTER_NOTES[0].concept),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: new RegExp(TITLES[0]) }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(t("notes.locked"))).toHaveLength(
      CHAPTER_NOTES.length,
    );
  });

  it("starts every unlocked chapter collapsed", () => {
    renderNotes([1, 2, 3]);
    for (const note of CHAPTER_NOTES) {
      expect(header(note.chapter)).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText(note.concept)).not.toBeInTheDocument();
    }
  });

  it("opens a chapter's concept, recap, grown-up name and questions on click", async () => {
    const user = userEvent.setup();
    renderNotes([1]);
    const note = CHAPTER_NOTES[0];

    await user.click(header(1));

    expect(header(1)).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(note.concept)).toBeInTheDocument();
    expect(screen.getByText(note.whatHappened)).toBeInTheDocument();
    expect(screen.getByText(note.grownUp)).toBeInTheDocument();
    for (const q of note.questions) {
      expect(screen.getByText(q)).toBeInTheDocument();
    }
  });

  it("collapses a chapter when its own title is clicked again", async () => {
    const user = userEvent.setup();
    renderNotes([1]);

    await user.click(header(1));
    expect(screen.getByText(CHAPTER_NOTES[0].concept)).toBeInTheDocument();

    await user.click(header(1));
    expect(
      screen.queryByText(CHAPTER_NOTES[0].concept),
    ).not.toBeInTheDocument();
    expect(header(1)).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses the open chapter when a different one is clicked", async () => {
    const user = userEvent.setup();
    renderNotes([1, 2, 3]);

    await user.click(header(1));
    expect(screen.getByText(CHAPTER_NOTES[0].concept)).toBeInTheDocument();

    await user.click(header(2));

    // Only one is ever open at a time.
    expect(
      screen.queryByText(CHAPTER_NOTES[0].concept),
    ).not.toBeInTheDocument();
    expect(screen.getByText(CHAPTER_NOTES[1].concept)).toBeInTheDocument();
    expect(header(1)).toHaveAttribute("aria-expanded", "false");
    expect(header(2)).toHaveAttribute("aria-expanded", "true");
    expect(header(3)).toHaveAttribute("aria-expanded", "false");
  });

  it("unlocks only the chapters it is told about", () => {
    renderNotes([1, 2]);
    expect(header(1)).toBeInTheDocument();
    expect(header(2)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: new RegExp(TITLES[2]) }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(t("notes.locked"))).toHaveLength(1);
  });

  it("forgets which chapter was open once the notebook is closed", async () => {
    const user = userEvent.setup();
    let closed = false;
    const { rerender } = renderWithLanguage(
      <Notes
        notes={CHAPTER_NOTES}
        titles={TITLES}
        unlocked={[1]}
        open
        onClose={() => {
          closed = true;
        }}
      />,
    );

    await user.click(header(1));
    expect(screen.getByText(CHAPTER_NOTES[0].concept)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: t("common.close") }));
    expect(closed).toBe(true);

    rerender(
      <Notes
        notes={CHAPTER_NOTES}
        titles={TITLES}
        unlocked={[1]}
        open={false}
        onClose={() => {}}
      />,
    );
    rerender(
      <Notes
        notes={CHAPTER_NOTES}
        titles={TITLES}
        unlocked={[1]}
        open
        onClose={() => {}}
      />,
    );

    // Reopening shows the list again, not whatever was last read.
    expect(
      screen.queryByText(CHAPTER_NOTES[0].concept),
    ).not.toBeInTheDocument();
  });
});
