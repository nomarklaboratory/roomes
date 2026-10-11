import { test, expect, waitForScene } from "../fixtures/studio";

test("zoom, fullscreen, and a 170 cm seated viewer work without changing the rental", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForScene(page);
  await expect(page.locator(".room-fallback")).toBeHidden();
  const canvas = page.locator("canvas");
  const screenshot = () => canvas.screenshot();
  const stage = page.locator("[data-preview-stage]");
  await canvas.scrollIntoViewIfNeeded();
  const stored = await page.evaluate(() =>
    localStorage.getItem("roomes.workspace.v1"),
  );
  const overview = await screenshot();
  await page
    .getByRole("button", { name: "Zoom in preview", exact: true })
    .click();
  expect((await screenshot()).equals(overview)).toBe(false);
  await page
    .getByRole("button", { name: "Zoom out preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Fullscreen preview", exact: true })
    .click();
  const exit = page.getByRole("button", {
    name: "Exit fullscreen preview",
    exact: true,
  });
  await expect(exit).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      const box = (await stage.boundingBox())!;
      const viewport = await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
      }));
      return (
        Math.abs(box.width - viewport.width) +
        Math.abs(box.height - viewport.height)
      );
    })
    .toBeLessThan(2);
  await stage.screenshot({
    path: `test-results/${testInfo.project.name}-fullscreen.png`,
  });
  await exit.click();
  await expect(
    page.getByRole("button", { name: "Fullscreen preview", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement === null))
    .toBe(true);
  await page.getByRole("button", { name: "First-person view" }).click();
  await expect(page.locator(".walk-caption")).toContainText(
    "170 cm person · Standing eyes 159 cm",
  );
  const standing = await screenshot();
  await page.getByRole("button", { name: "Sit in chair", exact: true }).click();
  await expect(page.locator(".walk-caption")).toContainText(
    "Seated eyes 123 cm",
  );
  await expect(
    page.getByRole("button", { name: "Walk forward", exact: true }),
  ).toHaveCount(0);
  const region = page.getByRole("region", { name: /^First-person workspace/ });
  // Keep the keyboard focus ring consistent across pixel comparisons.
  await region.press("Shift");
  const seated = await screenshot();
  expect(seated.equals(standing)).toBe(false);
  // Walking input cannot move the camera out of its chair while seated.
  await page.keyboard.down("w");
  await page.waitForTimeout(250);
  await page.keyboard.up("w");
  expect((await screenshot()).equals(seated)).toBe(true);
  await page
    .getByRole("button", { name: "Zoom in preview", exact: true })
    .click();
  await region.press("Shift");
  expect((await screenshot()).equals(seated)).toBe(false);
  await stage.screenshot({
    path: `test-results/${testInfo.project.name}-seated.png`,
  });
  await page.getByRole("button", { name: "Stand up", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Walk forward", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".walk-caption")).toContainText(
    "Standing eyes 159 cm",
  );
  await page.getByRole("button", { name: "Exit view", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("roomes.workspace.v1")),
  ).toBe(stored);
  expect(errors).toEqual([]);
});

test("fullscreen expands when the browser API is unavailable and Escape restores the preview", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new Error("Fullscreen unavailable"));
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Fullscreen preview", exact: true }),
  ).toBeVisible({ timeout: 45000 });
  await page.getByRole("button", { name: "First-person view" }).click();
  await page
    .getByRole("button", { name: "Fullscreen preview", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Exit fullscreen preview", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.fullscreenElement)).toBe(null);
  await expect(page.locator("body")).toHaveClass(/overflow-hidden/);
  const box = (await page.locator("[data-preview-stage]").boundingBox())!;
  expect(box.x).toBe(0);
  expect(box.y).toBe(0);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Fullscreen preview", exact: true }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/overflow-hidden/);
  await expect(
    page.getByRole("button", { name: "First-person view", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
