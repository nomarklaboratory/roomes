import {
  test,
  expect,
  chairPoint,
  chooseHoldAction,
  press,
  waitForScene,
  type Page,
} from "../fixtures/studio";
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

test("hold a mesh and slide to inspect its official product; taps, cancelled presses and drags do not inspect", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForScene(page);
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
  expect(await savedSetup(page)).toEqual(original);
  // The drag orbits the camera; reframe the top view before projecting again.
  await page.getByRole("button", { name: "Room", exact: true }).click();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  const next = await chairPoint(page);

  await chooseHoldAction(page, mobile, next, "inspect");
  const dialog = inspector(page);
  await expect(dialog).toBeVisible();
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

test("hold a nested accessory from inside the room to inspect that product", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await waitForScene(page);
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
  await chooseHoldAction(
    page,
    testInfo.project.name === "mobile",
    {
      x: box.x + ((point.x + 1) * box.width) / 2,
      y: box.y + ((1 - point.y) * box.height) / 2,
    },
    "inspect",
  );
  await expect(inspector(page)).toBeVisible();
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
