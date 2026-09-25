import { expect, test } from "@playwright/test";

test("switching language keeps your place and flips the page direction", async ({
  page,
}) => {
  await page.goto("http://localhost:3000");

  // Hebrew is the default, and the page is laid out right to left.
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "he");

  await page.getByRole("button", { name: "להיכנס לכפר" }).click();
  await page.getByRole("button", { name: "להתחיל" }).click();
  await expect(
    page.getByRole("heading", { name: "הבאר של יותם" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "English" }).click();

  // Same situation, same position in the chapter — only the words changed.
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "Yotam's Well" }),
  ).toBeVisible();
  await expect(page.getByText("Chapter 1 · Situation 1 of 4")).toBeVisible();

  // And back again, still in the same place.
  await page.getByRole("button", { name: "עברית" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("heading", { name: "הבאר של יותם" }),
  ).toBeVisible();
});

test("a rule written in Hebrew reads as an English sentence after switching", async ({
  page,
}) => {
  await page.goto("http://localhost:3000");

  await page.getByRole("button", { name: "להיכנס לכפר" }).click();
  await page.getByRole("button", { name: "להתחיל" }).click();

  // Build a rule: whoever lives in the village / must not take without
  // asking / always / must give it back or fix it.
  await page.getByRole("button", { name: "מי שגר בכפר" }).click();
  await page.getByRole("button", { name: "אסור לקחת בלי לבקש" }).click();
  await page.getByRole("button", { name: "תמיד", exact: true }).click();
  await page.getByRole("button", { name: "צריך להחזיר או לתקן" }).click();
  await page.getByRole("button", { name: "לכתוב את זה בספר" }).click();

  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: /The Rule Book/ }).click();

  const book = page.getByRole("dialog", { name: "The Rule Book" });
  await expect(
    book.getByText(
      "Whoever lives in the village must not take the water without asking, always. If not — they have to give it back or fix it.",
    ),
  ).toBeVisible();
});
