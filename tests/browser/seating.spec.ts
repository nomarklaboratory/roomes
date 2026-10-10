import { test, expect } from "@playwright/test";

test("sit directly from the preview or the selected chair, then stand up", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await expect(page.locator(".room-fallback")).toBeHidden();
  const saved = () =>
    page.evaluate(() => localStorage.getItem("roomes.workspace.v1"));
  const original = await saved();

  // The visible overview action enters seated first person in one click.
  await page.getByRole("button", { name: "Sit in chair", exact: true }).click();
  await expect(page.locator(".walk-caption")).toContainText(
    "Seated eyes 124 cm",
  );
  await expect(page.locator(".walk-caption")).toContainText(
    "In Ergonomic chair",
  );
  await expect(
    page.getByRole("button", { name: "Stand up", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Walk forward", exact: true }),
  ).toHaveCount(0);
  expect(await saved()).toBe(original);
  await page.getByRole("button", { name: "Stand up", exact: true }).click();
  await expect(page.locator(".walk-caption")).toContainText(
    "Standing eyes 159 cm",
  );
  await page.getByRole("button", { name: "Exit view", exact: true }).click();

  // The chair context action uses the current product and moved chair position.
  await page.getByRole("button", { name: "Chairs", exact: true }).click();
  await page
    .getByRole("button", { name: "Select Everyday chair", exact: true })
    .click();
  await page.getByRole("button", { name: "Chair", exact: true }).click();
  await page
    .getByRole("button", { name: "Move Everyday chair left", exact: true })
    .click();
  const moved = await saved();
  await page
    .locator(".placement-panel")
    .evaluate((panel) => panel.scrollIntoView({ block: "center" }));
  await page.locator(".placement-panel").screenshot({
    path: `test-results/${testInfo.project.name}-chair-actions.png`,
  });
  await page
    .getByRole("button", { name: "Sit in this chair", exact: true })
    .click();
  await expect(page.locator(".walk-caption")).toContainText(
    "In Everyday chair",
  );
  await expect(page.locator(".walk-caption")).toContainText(
    "Seated eyes 124 cm",
  );
  await expect(page.locator(".placement-panel")).toHaveCount(0);
  await page.locator(".preview-stage").screenshot({
    path: `test-results/${testInfo.project.name}-direct-seating.png`,
  });
  expect(await saved()).toBe(moved);
  await page.getByRole("button", { name: "Exit view", exact: true }).click();
  await page
    .getByRole("button", { name: "First-person view", exact: true })
    .click();
  await expect(page.locator(".walk-caption")).toContainText(
    "Standing eyes 159 cm",
  );
  expect(errors).toEqual([]);
});
