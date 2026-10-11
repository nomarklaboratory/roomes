import { test, expect, type Page } from "../fixtures/studio";
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
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
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
  await expect(
    page.getByRole("button", { name: "Select Jarvis Bamboo", exact: true }),
  ).toContainText("120 × 80 × 75 cm");
  await page.getByRole("button", { name: "Extras", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Torq Mod Fun Surfboard", exact: true })
    .click();
  await page.getByRole("button", { name: "Front", exact: true }).click();
  const canvas = page.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  // Real mouse/touch drag on the board's vertical plane, with the fitted camera.
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
  if (testInfo.project.name === "mobile") {
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 8; i++)
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x + i * 3, y: y + i * 2 }],
      });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await touch.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 24, y + 16, { steps: 8 });
    await page.mouse.up();
  }
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
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  expect(await saved(page)).toEqual(beforeReload);
  await page
    .getByRole("button", { name: "Review my setup", exact: true })
    .click();
  await expect(
    page.getByText("Room: 5 × 4 × 3 m", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".review-lines")).toContainText(
    "Torq Mod Fun Surfboard",
  );
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
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
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
  await page.getByRole("button", { name: "Extras", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Torq Mod Fun Surfboard", exact: true })
    .click();
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
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect
    .poll(async () => (await saved(page)).room)
    .toEqual({ width: 2.4, depth: 2.4, height: 2.2 });
  expect(errors).toEqual([]);
});
