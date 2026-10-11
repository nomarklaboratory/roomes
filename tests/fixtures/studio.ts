import { test as base, expect, type Page } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
export { expect, type Page } from "@playwright/test";

// Editor regressions start in Design. Onboarding tests use the unmodified
// Playwright fixture so first visits and migration paths remain exercised.
export const test = base.extend({
  page: async ({ page }, runTest) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "roomes.onboarding.v1",
          JSON.stringify({ version: 1, status: "complete" }),
        );
      } catch {
        /* Blocked-storage tests use the visible Skip action. */
      }
    });
    await runTest(page);
  },
});

// The loading panel is also absent before the preview mounts. Sit in chair
// renders only once the 3D scene and its models are ready.
export async function waitForScene(page: Page) {
  await expect(
    page.getByRole("button", { name: "Sit in chair", exact: true }),
  ).toBeVisible({ timeout: 45000 });
}

export async function openCatalog(page: Page) {
  await page.getByRole("button", { name: /^Open product catalog/ }).click();
  return page.getByRole("dialog", { name: "Make it yours." });
}

export async function closeCatalog(page: Page) {
  await page
    .getByRole("dialog", { name: "Make it yours." })
    .getByRole("button", { name: "Done", exact: true })
    .click();
}

export async function undo(page: Page) {
  const catalog = await openCatalog(page);
  await catalog.getByRole("button", { name: "Undo", exact: true }).click();
  await closeCatalog(page);
}

export async function chairPoint(
  page: Page,
  target = new Vector3(0.16, 0.65, 0.35),
) {
  const canvas = page.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  // Fullscreen and hydration update DOM bounds before the renderer's drawing
  // buffer. Project into the top camera only after the viewport has rendered.
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        if (!(element instanceof HTMLCanvasElement)) return Infinity;
        const bounds = element.getBoundingClientRect();
        return Math.abs(
          element.width / element.height - bounds.width / bounds.height,
        );
      }),
    )
    .toBeLessThan(0.002);
  await canvas.screenshot();
  const box = (await canvas.boundingBox())!;
  const factor = await page.evaluate(() => (innerWidth <= 700 ? 1.2 : 1));
  const camera = new PerspectiveCamera(37, box.width / box.height, 0.1, 1000);
  camera.position.set(0.01 * factor, 6 * factor, 0.01 * factor);
  camera.lookAt(0, 0.9, 0);
  camera.updateMatrixWorld();
  const point = target.clone().project(camera);
  return {
    x: box.x + ((point.x + 1) * box.width) / 2,
    y: box.y + ((1 - point.y) * box.height) / 2,
  };
}

export async function press(page: Page, mobile: boolean, x: number, y: number) {
  if (mobile) {
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y, id: 0 }],
    });
    return {
      move: (nextX: number, nextY: number) =>
        touch.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: nextX, y: nextY, id: 0 }],
        }),
      release: async (cancel = false) => {
        await touch.send("Input.dispatchTouchEvent", {
          type: cancel ? "touchCancel" : "touchEnd",
          touchPoints: [],
        });
        await touch.detach();
      },
    };
  }
  await page.mouse.move(x, y);
  await page.mouse.down();
  return {
    move: (nextX: number, nextY: number) =>
      page.mouse.move(nextX, nextY, { steps: 5 }),
    release: async (cancel = false) => {
      if (cancel)
        await page.locator("canvas").evaluate((element) =>
          element.dispatchEvent(
            new PointerEvent("pointercancel", {
              pointerId: 1,
              bubbles: true,
              isPrimary: true,
            }),
          ),
        );
      await page.mouse.up();
    },
  };
}

/** Holds a product, slides the action wheel in one direction, and releases. */
export async function chooseHoldAction(
  page: Page,
  mobile: boolean,
  point: { x: number; y: number },
  action: "move" | "inspect" | "duplicate" | "delete",
) {
  const offsets = {
    move: { x: -95, y: 0 },
    inspect: { x: 84, y: 0 },
    duplicate: { x: 0, y: -84 },
    delete: { x: 0, y: 84 },
  };
  const hold = await press(page, mobile, point.x, point.y);
  const wheel = page.locator("[data-product-wheel]");
  await expect(wheel).toBeVisible();
  const released = {
    x: point.x + offsets[action].x,
    y: point.y + offsets[action].y,
  };
  await hold.move(released.x, released.y);
  await expect(wheel).toHaveAttribute("data-action", action);
  await hold.release();
  return released;
}

/** Moves a held product by a screen offset and confirms with Place. */
export async function moveProduct(
  page: Page,
  mobile: boolean,
  point: { x: number; y: number },
  offset: { x: number; y: number },
) {
  const from = await chooseHoldAction(page, mobile, point, "move");
  await expect(page.locator("[data-move-mode]")).toBeVisible();
  if (mobile) {
    // Touch drags are relative and may start anywhere on the canvas. Measure
    // after move mode opens: its panel covers the top of the preview and can
    // shift the page.
    const box = (await page.locator("canvas").boundingBox())!;
    const start = { x: box.x + box.width / 2, y: box.y + box.height * 0.75 };
    const drag = await press(page, true, start.x, start.y);
    await drag.move(start.x + offset.x, start.y + offset.y);
    await drag.release();
  } else
    await page.mouse.move(from.x + offset.x, from.y + offset.y, {
      steps: 12,
    });
  await page.getByRole("button", { name: "Place", exact: true }).click();
  await expect(page.locator("[data-move-mode]")).toHaveCount(0);
}
