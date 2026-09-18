import { expect, test } from "@playwright/test";

test("scene, decide, outcome, and lesson all stack on one screen", async ({
  page,
}) => {
  await page.goto("http://localhost:3000");

  await page.getByRole("button", { name: "להיכנס לכפר" }).click();
  await page.getByRole("button", { name: "להתחיל" }).click();

  // Scene for c1s1 should be visible.
  await expect(
    page.getByRole("heading", { name: "הבאר של יותם" }),
  ).toBeVisible();
  // "יותם"/"דנה" are linkified names (separate DOM nodes), so match a
  // substring that doesn't straddle one.
  await expect(page.getByText("בקצה השדה שלו")).toBeVisible();

  // Skip writing a rule.
  await page.getByRole("button", { name: "לא לכתוב כלל הפעם" }).click();

  // Scene text should STILL be visible (not replaced).
  await expect(
    page.getByRole("heading", { name: "הבאר של יותם" }),
  ).toBeVisible();
  // A recap confirming the decide step is now shown.
  await expect(page.getByText("✓ לא לכתוב כלל הפעם")).toBeVisible();
  // Outcome section should now also be visible, on the same screen.
  await expect(page.getByText("לא החלטת כלום")).toBeVisible();

  await page.getByRole("button", { name: "ואז" }).click();

  // Scene + decide recap should STILL be visible.
  await expect(
    page.getByRole("heading", { name: "הבאר של יותם" }),
  ).toBeVisible();
  await expect(page.getByText("✓ לא לכתוב כלל הפעם")).toBeVisible();
  await expect(page.getByText("לא החלטת כלום")).toBeVisible();
  // Lesson section should now also be visible.
  await expect(page.getByText("עד עכשיו לא היה כאן שום כלל")).toBeVisible();

  await page.getByRole("button", { name: "הלאה" }).click();

  // Moving to the next situation should show ITS scene, not the old one.
  await expect(
    page.getByRole("heading", { name: "הדוכן על השביל" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "הבאר של יותם" }),
  ).not.toBeVisible();
});
