import { test, expect } from "@playwright/test";

test("design, persist, undo and complete an explicitly simulated rental", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Find your flow." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Select Wooden desk" }).click();
  await page.getByRole("button", { name: "Chairs", exact: true }).click();
  await page.getByRole("button", { name: "Select Everyday chair" }).click();
  await page.getByRole("button", { name: "Extras", exact: true }).click();
  await page.getByRole("button", { name: "Add 27″ monitor" }).click();
  await expect(
    page.getByRole("button", { name: "Add 27″ monitor" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Add Little green friend" }).click();
  await page.getByRole("button", { name: "8 weeks", exact: true }).click();
  await expect(page.locator(".rental-price")).toContainText("$336");
  await page.reload();
  await expect(page.locator(".rental-price")).toContainText("$336");
  await page.getByRole("button", { name: "Desks", exact: true }).click();
  await page.getByRole("button", { name: "Select Electric desk" }).click();
  await expect(page.getByRole("status")).toContainText("removed to fit");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".rental-price")).toContainText("$336");
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await expect(page.locator(".room-fallback")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await page.getByRole("button", { name: "Room", exact: true }).click();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-studio.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Review my setup" }).click();
  await expect(
    page.getByRole("heading", { name: "A good setup." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to designing" }).click();
  await expect(page.locator(".rental-price")).toContainText("$336");
  await page.getByRole("button", { name: "Review my setup" }).click();
  await page.getByLabel("Your name").fill("Alex Test");
  await page.getByLabel("Bali area").selectOption("Canggu");
  const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  await page.getByLabel("Preferred date").fill(future);
  await page.getByRole("button", { name: "Rent this setup" }).click();
  await expect(
    page.getByText("This is a demo confirmation.", { exact: false }),
  ).toBeVisible();
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain("Alex Test");
  expect(stored).not.toContain("Canggu");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-confirmation.png`,
    fullPage: true,
  });
});
test("all presets and finish variants work, with an accessible help dialog", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Room to create Spread/ }).click();
  await expect(page.locator(".rental-price")).toContainText("$136");
  await page.getByRole("button", { name: "Soft white" }).click();
  await expect(
    page.getByRole("button", { name: "Soft white" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "How it works" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Reset setup" }).click();
  await expect(page.locator(".rental-price")).toContainText("$108");
});
test("a device without WebGL can still configure and review its workspace", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/");
  await expect(
    page.getByText("2D preview · 3D is unavailable on this device"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Select Wooden desk" }).click();
  await expect(
    page.getByRole("img", { name: /Wooden desk, Ergonomic chair/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review my setup" }).click();
  await expect(
    page.getByRole("heading", { name: "A good setup." }),
  ).toBeVisible();
});
