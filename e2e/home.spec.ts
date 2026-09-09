import { expect, test } from "@playwright/test";

test("opens on the village-and-me screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "הכפר, לפני שנכנסים",
  );
  await expect(page.getByRole("button", { name: "להיכנס לכפר" })).toBeVisible();
});
