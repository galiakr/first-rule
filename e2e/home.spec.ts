import { expect, test } from "@playwright/test";

test("opens by showing a child who their rule lands on", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "אין כאן אף כלל",
  );

  // Before anything is chosen the village is neutral: no group is marked as
  // included or left out.
  const passersThrough = page.locator("article", {
    hasText: "לא גרים כאן",
  });
  await expect(passersThrough).toHaveAttribute("data-reached", "");

  // A rule for the people who live here leaves the passers-through out, and
  // the page says so rather than leaving it to be inferred. This is the whole
  // argument the entry screen makes.
  await page.getByRole("button", { name: "מי שגר בכפר" }).click();
  await expect(passersThrough).toHaveAttribute("data-reached", "no");
  await expect(page.getByText("הכלל הזה חל על 5 מתוך 6")).toBeVisible();

  // Widen it and they come back in.
  await page.getByRole("button", { name: "כל מי שנמצא כאן עכשיו" }).click();
  await expect(passersThrough).toHaveAttribute("data-reached", "yes");
  await expect(page.getByText("הכלל הזה חל על 6 מתוך 6")).toBeVisible();

  await expect(page.getByRole("button", { name: "להיכנס לכפר" })).toBeVisible();
});
