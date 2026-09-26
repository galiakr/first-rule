import { expect, test } from "@playwright/test";

test("a village survives closing the tab, and can be thrown away", async ({
  page,
}) => {
  await page.goto("http://localhost:3000");

  // Name a village and play the first situation through to the next one.
  await page.getByLabel("איך תרצה לקרוא לכפר הזה?").fill("עין חרוד");
  await page.getByRole("button", { name: "להיכנס לכפר" }).click();
  await page.getByRole("button", { name: "להתחיל" }).click();
  await page.getByRole("button", { name: "לא לכתוב כלל הפעם" }).click();
  await page.getByRole("button", { name: "ואז" }).click();
  await page.getByRole("button", { name: "הלאה" }).click();
  await expect(
    page.getByRole("heading", { name: "הדוכן על השביל" }),
  ).toBeVisible();

  // Closing the tab and coming back offers the village by name.
  await page.reload();
  await expect(page.getByText("עין חרוד", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "להמשיך", exact: true }).click();

  // And puts the child back at the situation they had reached, not at the
  // start — the first one is behind them.
  await expect(
    page.getByRole("heading", { name: "הדוכן על השביל" }),
  ).toBeVisible();
  await expect(page.getByText("מצב 2 מתוך 4")).toBeVisible();

  // Starting over asks first, because it cannot be undone.
  await page.reload();
  await page.getByRole("button", { name: "להתחיל כפר חדש" }).click();
  await expect(
    page.getByText("הכפר שהתחלת יימחק", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "לא, לחזור" }).click();
  await expect(
    page.getByRole("button", { name: "להמשיך", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "להתחיל כפר חדש" }).click();
  await page.getByRole("button", { name: "כן, להתחיל מחדש" }).click();

  // The village is gone: back to the opening screen, and it stays gone.
  await expect(
    page.getByRole("heading", { name: "הכפר, לפני שנכנסים" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "הכפר, לפני שנכנסים" }),
  ).toBeVisible();
});

test("the village can be thrown away from inside the game", async ({
  page,
}) => {
  await page.goto("http://localhost:3000");

  await page.getByLabel("איך תרצה לקרוא לכפר הזה?").fill("עין חרוד");
  await page.getByRole("button", { name: "להיכנס לכפר" }).click();
  await page.getByRole("button", { name: "להתחיל" }).click();
  await page.getByRole("button", { name: "לא לכתוב כלל הפעם" }).click();
  await page.getByRole("button", { name: "ואז" }).click();
  await page.getByRole("button", { name: "הלאה" }).click();

  // Mid-chapter, with no way back to the opening screen except this one.
  const contents = page.getByRole("dialog", { name: "תוכן העניינים" });
  await page.getByRole("button", { name: "תוכן העניינים" }).click();
  await contents.getByRole("button", { name: "להתחיל כפר חדש" }).click();
  await contents.getByRole("button", { name: "כן, להתחיל מחדש" }).click();

  await expect(
    page.getByRole("heading", { name: "הכפר, לפני שנכנסים" }),
  ).toBeVisible();

  // And it stays gone — no offer to resume what was just discarded.
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "הכפר, לפני שנכנסים" }),
  ).toBeVisible();
});
