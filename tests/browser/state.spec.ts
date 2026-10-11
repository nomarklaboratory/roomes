import { test, expect, type Page } from "../fixtures/studio";
import { PerspectiveCamera, Vector3 } from "three";
import { presetSetup, quote } from "../../lib/workspace.ts";
import { money } from "../../lib/catalog.ts";
import type { Setup } from "../../types/workspace.ts";

const saved = (page: Page): Promise<Setup> =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );

async function openCatalog(page: Page) {
  await page.getByRole("button", { name: /^Open product catalog/ }).click();
  return page.getByRole("dialog", { name: "Make it yours." });
}

test("legacy saves hydrate, catalog and summary agree, and checkout details remain private", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const legacy = { ...presetSetup("developer"), weeks: 8 as const };
  await page.addInitScript((setup) => {
    if (sessionStorage.getItem("legacy-seeded")) return;
    localStorage.setItem(
      "roomes.workspace.v1",
      JSON.stringify({ version: 2, setup }),
    );
    sessionStorage.setItem("legacy-seeded", "true");
  }, legacy);
  await page.goto("/");
  await expect(page.locator(".rental-price")).toContainText(
    money(quote(legacy).totalCents),
  );
  const catalog = await openCatalog(page);
  await catalog
    .getByRole("button", { name: "Select Jarvis Laminate", exact: true })
    .click();
  await catalog.getByRole("button", { name: "Chairs", exact: true }).click();
  await catalog
    .getByRole("button", { name: "Select Sayl", exact: true })
    .click();
  await catalog.getByRole("button", { name: "Extras", exact: true }).click();
  await catalog
    .getByRole("button", { name: "Add FEJKA Rosemary", exact: true })
    .click();
  await catalog.getByRole("button", { name: "Done", exact: true }).click();
  const configured = await saved(page);
  expect(configured.deskId).toBe("jarvis-laminate");
  expect(configured.chairId).toBe("herman-miller-sayl");
  expect(configured.items.some((item) => item.productId === "ikea-fejka")).toBe(
    true,
  );
  await page
    .locator(".item-chips")
    .getByRole("button", { name: "FEJKA Rosemary", exact: true })
    .click();
  await expect(page.locator(".placement-panel")).toBeVisible();
  const removalCatalog = await openCatalog(page);
  await removalCatalog
    .getByRole("button", { name: "Remove one FEJKA Rosemary", exact: true })
    .click();
  await expect(page.locator(".placement-panel")).toHaveCount(0);
  await removalCatalog
    .getByRole("button", { name: "Undo", exact: true })
    .click();
  await expect.poll(() => saved(page)).toEqual(configured);
  await removalCatalog
    .getByRole("button", { name: "Done", exact: true })
    .click();
  await expect(page.locator(".rental-price")).toContainText(
    money(quote(configured).totalCents),
  );
  await page.reload();
  await expect.poll(() => saved(page)).toEqual(configured);
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await page
    .getByRole("link", { name: "Rent this setup", exact: true })
    .click();
  await expect(page.locator("[data-checkout-total]")).toContainText(
    money(quote(configured).totalCents),
  );
  const stored = await page.evaluate(() =>
    localStorage.getItem("roomes.workspace.v1"),
  );
  await page.getByLabel("Full name").fill("State Test");
  await page.getByLabel("Email address").fill("state@example.com");
  await page.getByLabel("Phone number").fill("+628123456789");
  await page.getByLabel("Delivery address").fill("Jalan Test 1");
  await page.getByLabel("Area", { exact: true }).selectOption("Canggu");
  await page
    .getByLabel("Preferred delivery date")
    .fill(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  expect(
    await page.evaluate(() => localStorage.getItem("roomes.workspace.v1")),
  ).toBe(stored);
  await page
    .getByRole("button", { name: "Review rental request", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your rental request" }),
  ).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "State Test",
  );
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-zustand-checkout.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

async function chairPoint(page: Page) {
  const canvas = page.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  // Hydration mounts the preview later now. Wait for the drawing buffer to
  // match its DOM viewport and render the chosen camera before projecting.
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        if (!(element instanceof HTMLCanvasElement)) return Infinity;
        const box = element.getBoundingClientRect();
        return Math.abs(
          element.width / element.height - box.width / box.height,
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
  const point = new Vector3(0.16, 0.65, 0.35).project(camera);
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
      touchPoints: [{ x, y, id: 0 }],
    });
    return {
      move: (x: number, y: number) =>
        touch.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y, id: 0 }],
        }),
      release: async () => {
        await touch.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        await touch.detach();
      },
    };
  }
  await page.mouse.move(x, y);
  await page.mouse.down();
  return {
    move: (x: number, y: number) => page.mouse.move(x, y, { steps: 5 }),
    release: () => page.mouse.up(),
  };
}

test("real mouse/touch move drafts cancel cleanly and commit one undoable placement", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await expect(page.locator(".room-fallback")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Sit in chair", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  const mobile = testInfo.project.name === "mobile";
  const original = await saved(page);

  const startMove = async () => {
    const point = await chairPoint(page);
    const hold = await press(page, mobile, point.x, point.y);
    await expect(page.locator("[data-product-wheel]")).toBeVisible();
    await hold.move(point.x - 95, point.y);
    await expect(page.locator("[data-product-wheel]")).toHaveAttribute(
      "data-action",
      "move",
    );
    await hold.release();
    await expect(page.locator("[data-move-mode]")).toBeVisible();
    await expect(page.locator("canvas")).toHaveAttribute(
      "data-moving",
      "chair",
    );
    if (mobile) {
      const drag = await press(page, true, point.x - 95, point.y);
      await drag.move(point.x - 30, point.y + 20);
      await drag.release();
    } else await page.mouse.move(point.x - 30, point.y + 20, { steps: 12 });
  };

  await startMove();
  expect(await saved(page)).toEqual(original);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-move-mode]")).toHaveCount(0);
  expect(await saved(page)).toEqual(original);
  await page
    .getByRole("button", { name: "Close movement controls", exact: true })
    .click();

  await startMove();
  expect(await saved(page)).toEqual(original);
  await page.getByRole("button", { name: "Place", exact: true }).click();
  await expect
    .poll(async () => (await saved(page)).layout.chair)
    .not.toEqual(original.layout.chair);
  const catalog = await openCatalog(page);
  await catalog.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => saved(page)).toEqual(original);
  await expect(
    catalog.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await catalog.getByRole("button", { name: "Done", exact: true }).click();
  await startMove();
  await page.getByText(/^Room dimensions ·/).click();
  await page.getByLabel("Room width (m)").fill("4.2");
  await page
    .getByRole("button", { name: "Apply room size", exact: true })
    .click();
  await expect(page.locator("[data-move-mode]")).toHaveCount(0);
  expect((await saved(page)).layout.chair).toEqual(original.layout.chair);
  const roomCatalog = await openCatalog(page);
  await roomCatalog.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => saved(page)).toEqual(original);
  await roomCatalog.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("button", { name: "First-person view", exact: true })
    .click();
  await expect(page.locator(".walk-caption")).toContainText(
    "Standing eyes 159 cm",
  );
  await page.getByRole("button", { name: "Sit in chair", exact: true }).click();
  await expect(page.locator(".walk-caption")).toContainText(
    "Seated eyes 123 cm",
  );
  expect(await saved(page)).toEqual(original);
  expect(errors).toEqual([]);
});

test("blocked device storage keeps catalog and checkout usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByText(
      "Device storage unavailable. Changes will last for this tab.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip to designing" }).click();
  const catalog = await openCatalog(page);
  await catalog
    .getByRole("button", { name: "Select Jarvis Laminate", exact: true })
    .click();
  await catalog.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("link", { name: "Rent this setup", exact: true })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Order summary" }),
  ).toContainText("Jarvis Laminate");
  await page.getByRole("link", { name: "Back to studio" }).click();
  await expect(page.locator(".rental-price")).toContainText("$116");
});
