import { expect, test } from "@playwright/test";

test("opens by handing the child a law to write", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "אין כאן אף כלל",
  );

  // Four taps, and a sentence exists that did not before. This is the whole
  // argument the entry screen makes, so it is the thing worth pinning.
  const book = page.getByText("הכלל שלך").locator("..");
  await expect(book).not.toContainText("לא ייקח");

  for (const choice of [
    "מי שגר בכפר",
    "אסור לקחת בלי לבקש",
    "תמיד",
    "צריך להחזיר או לתקן",
  ]) {
    await page.getByRole("button", { name: choice }).click();
  }

  await expect(book).toContainText(
    "מי שגר בכפר לא ייקח את המים בלי לבקש, תמיד. אם לא — יצטרך להחזיר או לתקן.",
  );
  await expect(page.getByRole("button", { name: "להיכנס לכפר" })).toBeVisible();
});
