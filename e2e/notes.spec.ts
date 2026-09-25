import { expect, test } from "@playwright/test";

test("the notebook opens from the header and stays locked until a chapter ends", async ({
  page,
}) => {
  await page.goto("http://localhost:3000");

  await page.getByRole("button", { name: "להיכנס לכפר" }).click();
  await page.getByRole("button", { name: "להתחיל" }).click();

  await page.getByRole("button", { name: "מחברת" }).click();

  const notebook = page.getByRole("dialog", { name: "מחברת המושגים" });
  await expect(notebook).toBeVisible();

  // Nothing is earned yet: the chapters are listed, but every one of them is
  // marked as opening only at its end, and no concept is named.
  await expect(
    notebook.getByText("המחברת עוד ריקה", { exact: false }),
  ).toBeVisible();
  // Every chapter listed is still locked. The count is content-dependent
  // (it grows with each chapter built), so assert the invariant, not the
  // number: nothing is open, and no concept is named anywhere.
  const locked = notebook.getByText("נפתח בסוף הפרק");
  expect(await locked.count()).toBeGreaterThan(0);
  await expect(notebook.getByRole("button", { expanded: true })).toHaveCount(0);
  await expect(notebook.getByText("כלל הוא החלטה שמחליטים מראש")).toHaveCount(
    0,
  );

  // Closing it puts the child back exactly where they were.
  await notebook.getByRole("button", { name: "לסגור", exact: true }).click();
  await expect(notebook).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "הבאר של יותם" }),
  ).toBeVisible();
});
