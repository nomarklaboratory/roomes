import {
  test,
  expect,
  openCatalog,
  closeCatalog,
  undo,
  waitForScene,
} from "../fixtures/studio";

test("design, persist, undo and continue to checkout", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Find your flow." }),
  ).toBeVisible();
  const catalog = await openCatalog(page);
  await catalog.getByRole("button", { name: "Select Jarvis Laminate" }).click();
  await catalog.getByRole("button", { name: "Chairs", exact: true }).click();
  await catalog.getByRole("button", { name: "Select Sayl" }).click();
  await catalog.getByRole("button", { name: "Extras", exact: true }).click();
  await catalog.getByRole("button", { name: "Add Dell UltraSharp 27" }).click();
  await expect(
    catalog.getByRole("button", { name: "Add Dell UltraSharp 27" }),
  ).toBeDisabled();
  await catalog.getByRole("button", { name: "Add FEJKA Rosemary" }).click();
  await closeCatalog(page);
  await page.getByRole("button", { name: "8 weeks", exact: true }).click();
  await expect(page.locator(".rental-price")).toContainText("$336");
  await page.reload();
  await expect(page.locator(".rental-price")).toContainText("$336");
  const desks = await openCatalog(page);
  await desks.getByRole("button", { name: "Desks", exact: true }).click();
  await desks.getByRole("button", { name: "Select Jarvis Bamboo" }).click();
  await closeCatalog(page);
  await expect(
    page.getByRole("status").filter({ hasText: "removed to fit" }),
  ).toBeVisible();
  await undo(page);
  await expect(page.locator(".rental-price")).toContainText("$336");
  await waitForScene(page);
  await expect(page.locator(".room-fallback")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await page.getByRole("button", { name: "Room", exact: true }).click();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-studio.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "Rent this setup" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(
    page.getByRole("heading", { name: "Make room for good work." }),
  ).toBeVisible();
  await expect(page.locator("[data-checkout-total]")).toHaveText("$336");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.getByRole("link", { name: "Back to studio" }).click();
  await expect(page.locator(".rental-price")).toContainText("$336");
  expect(errors).toEqual([]);
});
test("finish variants and reset work, with an accessible help dialog", async ({
  page,
}) => {
  await page.goto("/");
  const catalog = await openCatalog(page);
  await catalog.getByRole("button", { name: "Select Jarvis Laminate" }).click();
  for (const finish of ["White laminate", "Black laminate"]) {
    await catalog.getByRole("button", { name: finish }).click();
    await expect(catalog.getByRole("button", { name: finish })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
  await closeCatalog(page);
  await expect(page.locator(".rental-price")).toContainText("$116");
  await page.getByRole("button", { name: "How it works" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const reset = await openCatalog(page);
  await reset.getByRole("button", { name: "Reset setup" }).click();
  await closeCatalog(page);
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
  const catalog = await openCatalog(page);
  await catalog.getByRole("button", { name: "Select Jarvis Laminate" }).click();
  await closeCatalog(page);
  await expect(
    page.getByRole("img", { name: /Jarvis Laminate, Aeron/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Rent this setup" }).click();
  await expect(
    page.getByRole("complementary", { name: "Order summary" }),
  ).toContainText("Jarvis Laminate");
});
