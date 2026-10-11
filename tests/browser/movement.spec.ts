import {
  test,
  expect,
  chairPoint,
  moveProduct,
  undo,
  waitForScene,
  type Page,
} from "../fixtures/studio";

const savedSetup = (page: Page) =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );

test("move furniture, precisely move accessories, persist layout, and explore in first person", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForScene(page);
  await expect(page.locator(".room-fallback")).toBeHidden();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  const canvas = page.locator("canvas");
  const mobile = testInfo.project.name === "mobile";
  const original = await savedSetup(page);
  // Real pointer/touch events reach the rendered chair mesh, rather than
  // mocking moves.
  const { x, y } = await chairPoint(page);
  await moveProduct(page, mobile, { x, y }, { x: 65, y: 20 });
  await expect
    .poll(async () => (await savedSetup(page)).layout.chair.x)
    .not.toBe(original.layout.chair.x);
  const dragged = await savedSetup(page);
  await undo(page);
  expect((await savedSetup(page)).layout.chair).toEqual(original.layout.chair);
  // A browser interruption must discard the press and restore camera controls.
  const { x: cancelX, y: cancelY } = await chairPoint(page);
  if (mobile) {
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: cancelX, y: cancelY }],
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: cancelX + 30, y: cancelY + 10 }],
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    });
    await touch.detach();
  } else {
    await page.mouse.move(cancelX, cancelY);
    await page.mouse.down();
    await page.mouse.move(cancelX + 30, cancelY + 10, { steps: 5 });
    await canvas.evaluate((element) =>
      element.dispatchEvent(
        new PointerEvent("pointercancel", {
          pointerId: 1,
          bubbles: true,
          isPrimary: true,
        }),
      ),
    );
    await page.mouse.up();
  }
  await expect(canvas).not.toHaveAttribute("data-dragging");
  expect((await savedSetup(page)).layout.chair).toEqual(original.layout.chair);
  await page.getByRole("button", { name: "Desk", exact: true }).click();
  await page
    .getByRole("button", { name: "Move Jarvis Bamboo right", exact: true })
    .click();
  expect((await savedSetup(page)).layout.desk.x).toBe(0.1);
  await page.getByRole("button", { name: "BenQ WiT", exact: true }).click();
  await page
    .getByRole("button", { name: "Move BenQ WiT left", exact: true })
    .click();
  const placed = await savedSetup(page);
  expect(
    placed.items.find((i: { productId: string }) => i.productId === "benq-wit")
      .position,
  ).toBeDefined();
  await page.reload();
  await waitForScene(page);
  expect((await savedSetup(page)).layout).toEqual(placed.layout);
  expect((await savedSetup(page)).items).toEqual(placed.items);
  await page.getByRole("button", { name: "First-person view" }).click();
  const region = page.getByRole("region", { name: /^First-person workspace/ });
  await expect(region).toBeFocused();
  await expect(
    page.getByText("Inside your space", { exact: true }),
  ).toBeVisible();
  const before = await canvas.screenshot();
  const walkLeft = page.getByRole("button", { name: "Walk left", exact: true });
  await walkLeft.focus();
  await page.keyboard.down("Enter");
  await page.waitForTimeout(500);
  await page.keyboard.up("Enter");
  const after = await canvas.screenshot();
  expect(after.equals(before)).toBe(false);
  expect(await savedSetup(page)).toEqual(placed);
  await page.locator("[data-preview-stage]").screenshot({
    path: `test-results/${testInfo.project.name}-first-person.png`,
  });
  await page.getByRole("button", { name: "Recenter", exact: true }).click();
  await page.getByRole("button", { name: "Exit view", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Room", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "First-person view" }).click();
  await region.press("Escape");
  await expect(
    page.getByText("Inside your space", { exact: true }),
  ).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
  expect(dragged.layout.chair).not.toEqual(original.layout.chair);
});
