import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LinkedText from "@/components/LinkedText";

describe("LinkedText", () => {
  it("renders plain text untouched when no character is mentioned", () => {
    render(<LinkedText text="הבאר הייתה ריקה." />);
    expect(screen.getByText("הבאר הייתה ריקה.")).toBeInTheDocument();
  });

  it("turns a mentioned character into a focusable, hoverable name", () => {
    render(<LinkedText text="דנה ממלאת דלי." />);
    // The tooltip repeats the name too, so the trigger is found by its
    // accessible label — the one place that name is uniquely attached.
    const trigger = screen.getByLabelText(/^דנה —/);
    expect(trigger.tagName).toBe("SPAN");
    expect(trigger).toHaveAttribute("tabIndex", "0");
    expect(trigger.getAttribute("aria-label")).toContain("הרועים");
  });

  it("still finds the name when a Hebrew prefix is glued to it", () => {
    // "לשירה" = "to שירה" — Hebrew prepositions attach with no space.
    render(<LinkedText text="זה לא חל על לשירה הפעם." />);
    expect(screen.getByLabelText(/^שירה —/)).toBeInTheDocument();
  });

  it("shows every group a character belongs to", () => {
    // שירה is both a child and a shepherd (design doc §4).
    render(<LinkedText text="שירה מחכה." />);
    const trigger = screen.getByLabelText(/^שירה —/);
    expect(trigger.getAttribute("aria-label")).toContain("הילדים");
    expect(trigger.getAttribute("aria-label")).toContain("הרועים");
  });

  it("flags a character who doesn't live in the village", () => {
    render(<LinkedText text="נעם עבר בכפר." />);
    const trigger = screen.getByLabelText(/^נעם —/);
    expect(trigger.getAttribute("aria-label")).toContain("לא גר בכפר");
  });

  it("never linkifies 'אתה' (the child, Chapter 3) — it isn't in ACTORS", () => {
    // Real Chapter 3 prose (c3s1): full of "אתה" in ordinary narration.
    // Confirms CHILD_ACTOR staying out of ACTORS actually holds at the
    // component that would otherwise over-match it.
    const text =
      "הבוקר אתה צריך מים בדחיפות — מישהו נחבל קרוב לשדה, וצריך לשטוף ולקרר. " +
      "הבאר של יותם הכי קרובה. אין זמן לחפש אותו ולשאול. אתה ממלא דלי ורץ הלאה.";
    render(<LinkedText text={text} />);
    expect(screen.queryByLabelText(/^אתה —/)).not.toBeInTheDocument();
    // יותם, the one real character mentioned, is still linkified normally.
    expect(screen.getByLabelText(/^יותם —/)).toBeInTheDocument();
  });
});
