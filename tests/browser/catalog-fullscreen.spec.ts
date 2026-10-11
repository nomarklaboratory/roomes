import { test, expect } from "../fixtures/studio";

for (const mode of ["native", "fallback"] as const) {
  test(`catalog stays usable in ${mode} fullscreen and closing it keeps the preview expanded`, async ({
    page,
  }, testInfo) => {
    if (mode === "fallback")
      await page.addInitScript(() => {
        Element.prototype.requestFullscreen = () =>
          Promise.reject(new Error("Fullscreen unavailable"));
      });
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Sit in chair", exact: true }),
    ).toBeVisible({ timeout: 45000 });
    await page
      .getByRole("button", { name: "Fullscreen preview", exact: true })
      .click();
    const exit = page.getByRole("button", {
      name: "Exit fullscreen preview",
      exact: true,
    });
    await expect(exit).toBeVisible();
    if (mode === "native")
      expect(
        await page.evaluate(() => Boolean(document.fullscreenElement)),
      ).toBe(true);
    await page.getByRole("button", { name: /^Open product catalog/ }).click();
    const catalog = page.getByRole("dialog", { name: "Make it yours." });
    await expect(catalog).toBeVisible();
    await catalog
      .getByRole("button", { name: "Extras", exact: true })
      .click({ timeout: 2500 });
    await catalog
      .getByRole("button", { name: "Add FEJKA Rosemary", exact: true })
      .click();
    await expect(
      catalog.getByRole("button", {
        name: "Remove one FEJKA Rosemary",
        exact: true,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/${testInfo.project.name}-${mode}-fullscreen-catalog.png`,
      scale: "css",
    });
    await page.keyboard.press("Escape");
    await expect(catalog).toHaveCount(0);
    await expect(exit).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Open product catalog/ }),
    ).toBeFocused();
    await exit.click();
    await expect(
      page.getByRole("button", { name: "Fullscreen preview", exact: true }),
    ).toBeVisible();
  });
}
