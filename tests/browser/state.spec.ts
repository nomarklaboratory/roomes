import {
  test,
  expect,
  chairPoint,
  chooseHoldAction,
  openCatalog,
  press,
  waitForScene,
  type Page,
} from "../fixtures/studio";
import { presetSetup, quote } from "../../lib/workspace.ts";
import { money } from "../../lib/catalog.ts";
import type { Setup } from "../../types/workspace.ts";

const saved = (page: Page): Promise<Setup> =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );

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
  await waitForScene(page);
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

test("real mouse/touch move drafts cancel cleanly, lock room size, and commit one undoable placement", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForScene(page);
  await expect(page.locator(".room-fallback")).toBeHidden();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  const mobile = testInfo.project.name === "mobile";
  const original = await saved(page);

  const startMove = async () => {
    const point = await chairPoint(page);
    await chooseHoldAction(page, mobile, point, "move");
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
  await expect(page.getByLabel("Room width (m)")).toBeDisabled();
  await expect(
    page.getByText(
      "Place or cancel the moving item before changing room size.",
    ),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-move-mode]")).toHaveCount(0);
  await expect(page.getByLabel("Room width (m)")).toBeEnabled();
  expect(await saved(page)).toEqual(original);
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
