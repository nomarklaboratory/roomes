import { test, expect, type Page } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";

const savedSetup = (page: Page) =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );

test("drag furniture, precisely move accessories, persist layout, and explore in first person", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await expect(page.locator(".room-fallback")).toBeHidden();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  const canvas = page.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  // Project a visible part of the chair into the top-view camera. This sends
  // real pointer/touch events to the rendered mesh, rather than mocking moves.
  const factor = testInfo.project.name === "mobile" ? 1.2 : 1;
  const camera = new PerspectiveCamera(37, box.width / box.height, 0.1, 1000);
  camera.position.set(0.01 * factor, 6 * factor, 0.01 * factor);
  camera.lookAt(0, 0.9, 0);
  camera.updateMatrixWorld();
  const point = new Vector3(0.16, 0.65, 0.35).project(camera);
  const x = box.x + ((point.x + 1) * box.width) / 2;
  const y = box.y + ((1 - point.y) * box.height) / 2;
  const original = await savedSetup(page);
  if (testInfo.project.name === "mobile") {
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 10; i++)
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x + i * 4, y: y + i * 1.5 }],
      });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await touch.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 40, y + 15, { steps: 10 });
    await page.mouse.up();
  }
  await expect
    .poll(async () => (await savedSetup(page)).layout.chair.x)
    .not.toBe(original.layout.chair.x);
  await expect(page.locator(".placement-panel")).toContainText(
    "Ergonomic chair",
  );
  const dragged = await savedSetup(page);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await savedSetup(page)).layout.chair).toEqual(original.layout.chair);
  // A browser interruption must discard the draft and restore camera controls.
  await canvas.scrollIntoViewIfNeeded();
  const currentBox = (await canvas.boundingBox())!;
  const cancelX = x - box.x + currentBox.x;
  const cancelY = y - box.y + currentBox.y;
  if (testInfo.project.name === "mobile") {
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
    .getByRole("button", { name: "Move Electric desk right", exact: true })
    .click();
  expect((await savedSetup(page)).layout.desk.x).toBe(0.1);
  await page.getByRole("button", { name: "Desk lamp", exact: true }).click();
  await page
    .getByRole("button", { name: "Move Desk lamp left", exact: true })
    .click();
  const placed = await savedSetup(page);
  expect(
    placed.items.find((i: { productId: string }) => i.productId === "desk-lamp")
      .position,
  ).toBeDefined();
  await page.reload();
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
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
  await page.locator(".preview-stage").screenshot({
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
