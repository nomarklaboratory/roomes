import {
  test,
  expect,
  openCatalog,
  closeCatalog,
  moveProduct,
  undo,
  waitForScene,
  type Page,
} from "../fixtures/studio";
import { PerspectiveCamera, Vector3 } from "three";

const saved = (page: Page) =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );

test("custom room dimensions resize the scene, preserve scale, and persist a wall-mounted surfboard", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForScene(page);
  await page.getByText(/^Room dimensions ·/).click();
  await page.getByLabel("Room width (m)").fill("5");
  await page.getByLabel("Room depth (m)").fill("4");
  await page.getByLabel("Room height (m)").fill("3");
  await page
    .getByRole("button", { name: "Apply room size", exact: true })
    .click();
  await expect
    .poll(async () => (await saved(page)).room)
    .toEqual({ width: 5, depth: 4, height: 3 });
  await expect(
    page.getByText("20 m² floor area", { exact: true }),
  ).toBeVisible();
  const catalog = await openCatalog(page);
  await expect(
    catalog.getByRole("button", { name: "Select Jarvis Bamboo", exact: true }),
  ).toContainText("120 × 80 × 75 cm");
  await catalog.getByRole("button", { name: "Extras", exact: true }).click();
  await catalog
    .getByRole("button", { name: "Add Torq Mod Fun Surfboard", exact: true })
    .click();
  await closeCatalog(page);
  await page.getByRole("button", { name: "Front", exact: true }).click();
  const canvas = page.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  // Real mouse/touch move on the board's vertical plane, with the fitted camera.
  const board = (await saved(page)).items.find(
    (item: { productId: string }) => item.productId === "torq-mod-fun",
  );
  const at = board.position ?? {
    x: 0,
    y: 3 - 0.5334 - 0.25,
    z: -2 + 0.085 + 0.06985 / 2 + 0.025,
  };
  const box = (await canvas.boundingBox())!;
  const scale = 5 / 3.6;
  const factor = scale * (testInfo.project.name === "mobile" ? 1.2 : 1);
  const camera = new PerspectiveCamera(37, box.width / box.height, 0.1, 1000);
  camera.position.set(0, 2.1 * factor, 5.7 * factor);
  camera.lookAt(0, 0.9 * scale, 0);
  camera.updateMatrixWorld();
  const point = new Vector3(at.x, at.y + 0.5334 / 2, at.z + 0.035).project(
    camera,
  );
  const x = box.x + ((point.x + 1) * box.width) / 2;
  const y = box.y + ((1 - point.y) * box.height) / 2;
  await moveProduct(
    page,
    testInfo.project.name === "mobile",
    { x, y },
    { x: 65, y: 40 },
  );
  await expect
    .poll(
      async () =>
        (await saved(page)).items.find(
          (item: { id: string }) => item.id === board.id,
        ).position?.x,
    )
    .not.toBeUndefined();
  await expect(page.locator(".placement-panel")).toContainText("BACK WALL");
  await expect(page.locator(".slot-buttons")).toHaveCount(0);
  const moved = (await saved(page)).items.find(
    (item: { id: string }) => item.id === board.id,
  ).position;
  expect(moved.x).not.toBe(at.x);
  expect(moved.y).not.toBe(at.y);
  expect(moved.z).toBeCloseTo(at.z, 5);
  await page
    .getByRole("button", {
      name: "Move Torq Mod Fun Surfboard up",
      exact: true,
    })
    .click();
  await expect
    .poll(
      async () =>
        (await saved(page)).items.find(
          (item: { id: string }) => item.id === board.id,
        ).position.y,
    )
    .toBeCloseTo(moved.y + 0.1, 3);
  await page.locator("[data-preview-stage]").screenshot({
    path: `test-results/${testInfo.project.name}-custom-room-wall.png`,
  });
  const beforeReload = await saved(page);
  await page.reload();
  await waitForScene(page);
  expect(await saved(page)).toEqual(beforeReload);
  await page.getByRole("link", { name: "Rent this setup" }).click();
  const summary = page.getByRole("complementary", { name: "Order summary" });
  await expect(
    summary.getByText("Room: 5 × 4 × 3 m", { exact: true }),
  ).toBeVisible();
  await expect(summary).toContainText("Torq Mod Fun Surfboard");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test("room limits reject invalid input, reset discards a draft, and the smallest room supports sitting", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForScene(page);
  await page.getByText(/^Room dimensions ·/).click();
  await page.getByLabel("Room width (m)").fill("0");
  await page
    .getByRole("button", { name: "Apply room size", exact: true })
    .click();
  expect((await saved(page)).room.width).toBe(3.6);
  await page
    .getByRole("button", { name: "Reset room size", exact: true })
    .click();
  await expect(page.getByLabel("Room width (m)")).toHaveValue("3.6");
  await page.getByLabel("Room width (m)").fill("2.4");
  await page.getByLabel("Room depth (m)").fill("2.4");
  await page.getByLabel("Room height (m)").fill("2.2");
  const before = await page.locator("canvas").screenshot();
  await page
    .getByRole("button", { name: "Apply room size", exact: true })
    .click();
  await expect.poll(async () => (await saved(page)).room.height).toBe(2.2);
  const after = await page.locator("canvas").screenshot();
  expect(after.equals(before)).toBe(false);
  const extras = await openCatalog(page);
  await extras.getByRole("button", { name: "Extras", exact: true }).click();
  await extras
    .getByRole("button", { name: "Add Torq Mod Fun Surfboard", exact: true })
    .click();
  await closeCatalog(page);
  await page.getByRole("button", { name: "Room", exact: true }).click();
  await page.locator("[data-preview-stage]").screenshot({
    path: `test-results/${testInfo.project.name}-smallest-room.png`,
  });
  await page.getByRole("button", { name: "Sit in chair", exact: true }).click();
  await expect(page.locator(".walk-caption")).toContainText(
    "Seated eyes 123 cm",
  );
  await page.getByRole("button", { name: "Stand up", exact: true }).click();
  await expect(
    page.getByText("Inside your space", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Exit view", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset room size", exact: true })
    .click();
  await expect
    .poll(async () => (await saved(page)).room)
    .toEqual({ width: 3.6, depth: 3.1, height: 2.65 });
  await undo(page);
  await expect
    .poll(async () => (await saved(page)).room)
    .toEqual({ width: 2.4, depth: 2.4, height: 2.2 });
  expect(errors).toEqual([]);
});
