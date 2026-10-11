import { test, expect, type Page } from "../fixtures/studio";
import { PerspectiveCamera, Vector3 } from "three";
import { catalog as products, money } from "../../lib/catalog.ts";
import { positionOf } from "../../lib/placement.ts";
import { quote } from "../../lib/workspace.ts";
import type { Setup } from "../../types/workspace.ts";

const inspector = (page: Page) =>
  page.getByRole("dialog", { name: "Real product inspection" });

const savedSetup = (page: Page): Promise<Setup> =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );

async function chairPoint(page: Page, target = new Vector3(0.16, 0.65, 0.35)) {
  const canvas = page.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  // Fullscreen updates DOM bounds before the renderer's drawing buffer.
  // Project into the camera only after the new viewport has rendered.
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

async function press(page: Page, mobile: boolean, x: number, y: number) {
  if (mobile) {
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    return {
      move: (nextX: number, nextY: number) =>
        touch.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: nextX, y: nextY }],
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

test("the wheel duplicates the held accessory directly in fullscreen and keeps inspection working", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Sit in chair", exact: true }),
  ).toBeVisible({ timeout: 45000 });
  await page.getByRole("button", { name: /^Open product catalog/ }).click();
  const catalog = page.getByRole("dialog", { name: "Make it yours." });
  await catalog
    .getByRole("button", { name: "Select Jarvis Laminate", exact: true })
    .click();
  await catalog.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await page
    .getByRole("button", { name: "Fullscreen preview", exact: true })
    .click();
  const original = await savedSetup(page);
  const source = original.items.find(
    (item) => products[item.productId].kind === "monitor",
  )!;
  const local = positionOf(original, source.id);
  const target = new Vector3(
    original.layout.desk.x + local.x,
    1.1,
    original.layout.desk.z + local.z,
  );
  const point = await chairPoint(page, target);
  const mobile = testInfo.project.name === "mobile";
  const copy = await press(page, mobile, point.x, point.y);
  const wheel = page.locator("[data-product-wheel]");
  await expect(wheel).toBeVisible();
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-product-hold",
    source.id,
  );
  await copy.move(point.x, point.y - 84);
  await expect(wheel).toHaveAttribute("data-action", "duplicate");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-duplicate-wheel.png`,
    scale: "css",
  });
  await copy.release();
  await expect(catalog).toHaveCount(0);
  await expect(page.locator("canvas")).not.toHaveAttribute("data-product-hold");
  await expect(page.locator("[data-move-mode]")).toHaveCount(0);
  await expect
    .poll(
      async () =>
        (await savedSetup(page)).items.filter(
          (item) => item.productId === source.productId,
        ).length,
    )
    .toBe(2);
  await expect(page.locator(".rental-price")).toContainText(
    money(
      quote(original).totalCents +
        products[source.productId].weeklyCents * original.weeks,
    ),
  );
  const result = await savedSetup(page);
  expect(
    result.items.find(
      (item) => item.id !== source.id && item.productId === source.productId,
    )?.id,
  ).not.toBe(source.id);
  expect(result.layout).toEqual(original.layout);
  await expect(
    page.getByRole("button", { name: "Exit fullscreen preview", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Open product catalog/ }).click();
  await catalog.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await savedSetup(page)).toEqual(original);
  await catalog.getByRole("button", { name: "Done", exact: true }).click();
  const next = await chairPoint(page, target);
  const inspect = await press(page, mobile, next.x, next.y);
  await expect(wheel).toBeVisible();
  await inspect.move(next.x + 84, next.y);
  await expect(wheel).toHaveAttribute("data-action", "inspect");
  await inspect.release();
  await expect(
    inspector(page).getByRole("heading", {
      name: products[source.productId].name,
      exact: true,
    }),
  ).toBeVisible();
  await inspector(page)
    .getByRole("button", { name: "Close product inspection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Exit fullscreen preview", exact: true })
    .click();
  expect(errors).toEqual([]);
});

test("hold a mesh to inspect its official product; taps, cancelled presses and drags do not inspect", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await page.getByRole("button", { name: "Top", exact: true }).click();
  const mobile = testInfo.project.name === "mobile";
  const point = await chairPoint(page);
  const original = await savedSetup(page);

  const tap = await press(page, mobile, point.x, point.y);
  await tap.release();
  await page.waitForTimeout(700);
  await expect(inspector(page)).toHaveCount(0);

  const cancelled = await press(page, mobile, point.x, point.y);
  await cancelled.release(true);
  await page.waitForTimeout(700);
  await expect(inspector(page)).toHaveCount(0);
  await expect(page.locator("canvas")).not.toHaveAttribute("data-dragging");

  const escaped = await press(page, mobile, point.x, point.y);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  await expect(inspector(page)).toHaveCount(0);
  await escaped.release();
  await expect(page.locator("canvas")).not.toHaveAttribute("data-dragging");

  const drag = await press(page, mobile, point.x, point.y);
  await drag.move(point.x + 40, point.y + 15);
  await page.waitForTimeout(700);
  await expect(inspector(page)).toHaveCount(0);
  await drag.release();
  await expect
    .poll(async () => (await savedSetup(page)).layout.chair.x)
    .not.toBe(original.layout.chair.x);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  const next = await chairPoint(page);

  const hold = await press(page, mobile, next.x, next.y);
  await expect(inspector(page)).toBeVisible();
  await hold.release();
  const dialog = inspector(page);
  await expect(
    dialog.getByRole("heading", { name: "Aeron", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: /Graphite Aeron/ }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: /View official product/ }),
  ).toHaveAttribute("href", /hermanmiller\.com/);
  await expect(page.locator("canvas")).not.toHaveAttribute("data-dragging");
  expect(await savedSetup(page)).toEqual(original);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-held-product.png`,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Inspect product", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("hold inspection works in a read-only review and browser fullscreen", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await page
    .getByRole("button", { name: "Review my setup", exact: true })
    .click();
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await page
    .getByRole("button", { name: "Fullscreen preview", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Exit fullscreen preview", exact: true }),
  ).toBeVisible();
  const original = await savedSetup(page);
  const point = await chairPoint(page);
  const hold = await press(
    page,
    testInfo.project.name === "mobile",
    point.x,
    point.y,
  );
  await expect(inspector(page)).toBeVisible();
  await hold.release();
  await expect(
    inspector(page).getByRole("heading", { name: "Aeron", exact: true }),
  ).toBeVisible();
  expect(await savedSetup(page)).toEqual(original);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-fullscreen-held-product.png`,
  });
  await inspector(page)
    .getByRole("button", { name: "Close product inspection" })
    .click();
  await expect(inspector(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Exit fullscreen preview", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Exit fullscreen preview", exact: true })
    .click();
});

test("hold a nested accessory from inside the room to inspect that product", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await page
    .getByRole("button", { name: "First-person view", exact: true })
    .click();
  const region = page.getByRole("region", { name: /^First-person workspace/ });
  await expect(region).toBeFocused();
  const canvas = page.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  const camera = new PerspectiveCamera(65, box.width / box.height, 0.05, 1000);
  camera.position.set(0, 1.59, 1.26);
  camera.lookAt(0, 1.02, -0.43);
  camera.updateMatrixWorld();
  // The screen is an accessory nested inside the movable desk group. The
  // nearest product must handle the hold instead of its parent desk.
  const point = new Vector3(0, 1.1, -0.72).project(camera);
  const hold = await press(
    page,
    testInfo.project.name === "mobile",
    box.x + ((point.x + 1) * box.width) / 2,
    box.y + ((1 - point.y) * box.height) / 2,
  );
  await expect(inspector(page)).toBeVisible();
  await hold.release();
  await expect(
    inspector(page).getByRole("heading", {
      name: "Dell UltraSharp 27",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(inspector(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "First-person view", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});
