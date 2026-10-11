import { test, expect } from "../fixtures/studio";

test("product photos advertise details, zoom from the image, and support panning and reset", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  const panel = page.getByRole("dialog", { name: "Real product inspection" });
  await expect(panel).toBeVisible();
  const zoom = panel.getByRole("button", { name: "Zoom photo", exact: true });
  await expect(zoom).toContainText("View details");
  await expect(zoom).toHaveCSS("cursor", "zoom-in");
  // The full image is the target, including away from the corner hint.
  await zoom.click({ position: { x: 30, y: 30 } });
  const reset = panel.getByRole("button", { name: "Reset zoom", exact: true });
  await expect(reset).toHaveAttribute("aria-pressed", "true");
  await expect(panel.getByText("Drag or swipe to explore")).toBeVisible();
  const photo = panel.locator("[data-photo-viewport]");
  await photo.scrollIntoViewIfNeeded();
  await expect
    .poll(() => photo.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  const before = await photo.evaluate((element) => ({
    x: element.scrollLeft,
    y: element.scrollTop,
  }));
  const box = (await photo.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  if (testInfo.project.name === "mobile") {
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 4; i++)
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - i * 15, y: y - i * 10 }],
      });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await touch.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 60, y - 40, { steps: 4 });
    await page.mouse.up();
  }
  await expect
    .poll(() => photo.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before.x + 20);
  await panel.screenshot({
    path: `test-results/${testInfo.project.name}-photo-details.png`,
    scale: "css",
  });
  await reset.click();
  await expect(zoom).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() =>
      photo.evaluate((element) => ({
        x: element.scrollLeft,
        y: element.scrollTop,
      })),
    )
    .toEqual({ x: 0, y: 0 });
  await panel
    .getByRole("button", {
      name: "View Bamboo surface and edge detail",
      exact: true,
    })
    .click();
  await zoom.click();
  await expect(reset).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Inspect product", exact: true }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});
