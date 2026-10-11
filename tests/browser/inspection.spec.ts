import { test, expect } from "../fixtures/studio";

const inspector = (page: import("@playwright/test").Page) =>
  page.getByRole("dialog", { name: "Real product inspection" });

test("inspect centered real photos, zoom details, and follow finish/product changes", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("roomes.workspace.v1")),
    )
    .not.toBeNull();
  const saved = await page.evaluate(() =>
    localStorage.getItem("roomes.workspace.v1"),
  );
  const before = (await page.locator("[data-preview-stage]").boundingBox())!;
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  const panel = inspector(page);
  await expect(panel).toBeFocused();
  await expect(
    panel.getByRole("heading", { name: "Jarvis Bamboo", exact: true }),
  ).toBeVisible();
  await panel
    .getByRole("button", {
      name: "View Bamboo surface and edge detail",
      exact: true,
    })
    .click();
  await panel.getByRole("button", { name: "Zoom photo", exact: true }).click();
  await expect(
    panel.getByRole("button", { name: "Reset zoom", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    panel.getByRole("img", { name: /Bamboo surface and edge detail/ }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-material-detail.png`,
  });
  const sceneBox = (await page
    .locator("[data-scene-container]")
    .boundingBox())!;
  const panelBox = (await panel.boundingBox())!;
  expect(sceneBox.height).toBeGreaterThan(100);
  expect(sceneBox.width).toBeGreaterThan(100);
  const viewport = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
  }));
  expect(
    Math.abs(panelBox.x + panelBox.width / 2 - viewport.width / 2),
  ).toBeLessThan(2);
  expect(
    Math.abs(panelBox.y + panelBox.height / 2 - viewport.height / 2),
  ).toBeLessThan(2);
  const after = (await page.locator("[data-preview-stage]").boundingBox())!;
  expect(after.width).toBe(before.width);
  expect(after.height).toBe(before.height);
  // Background controls cannot take focus while the native dialog is modal.
  expect(
    await page
      .getByRole("button", { name: "Inspect product", exact: true })
      .evaluate((button) => {
        button.focus();
        return document.activeElement === button;
      }),
  ).toBe(false);
  expect(
    await page.evaluate(() => localStorage.getItem("roomes.workspace.v1")),
  ).toBe(saved);

  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Select Jarvis Laminate", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "Jarvis Laminate", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("button", { name: "Zoom photo", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Black laminate", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  await expect(
    panel.getByRole("img", { name: /Black laminate tabletop/ }),
  ).toBeVisible();
  await expect(
    panel.getByRole("button", { name: /View White laminate tabletop/ }),
  ).toHaveCount(0);
  await panel.getByRole("button", { name: "Aeron", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Chairs", exact: true }).click();
  await page.getByRole("button", { name: "Select Sayl", exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  await panel.getByRole("button", { name: "Sayl", exact: true }).click();
  await expect(
    panel.getByRole("heading", { name: "Sayl", exact: true }),
  ).toBeVisible();
  await panel
    .getByRole("button", {
      name: "View Kingsmead upholstery texture",
      exact: true,
    })
    .click();
  await expect(
    panel.getByRole("img", { name: /Kingsmead upholstery texture/ }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-chair-inspection.png`,
  });
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Inspect product", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Review my setup", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  await expect(inspector(page)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test("recorded films load only on Play and stop on product change or closing; inspection works inside fullscreen", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new Error("Unavailable"));
  });
  let movieRequests = 0;
  await page.route("**/fv_prd_ovw_aeron_chair.mp4", async (route) => {
    movieRequests++;
    await route.fulfill({
      path: "tests/fixtures/inspection.webm",
      contentType: "video/webm",
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Fullscreen preview", exact: true }),
  ).toBeVisible({ timeout: 45000 });
  await page
    .getByRole("button", { name: "First-person view", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Fullscreen preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  const panel = inspector(page);
  await expect(panel).toBeFocused();
  await panel.getByRole("button", { name: "Aeron", exact: true }).click();
  await panel
    .getByRole("button", {
      name: "View Aeron in motion · manufacturer film",
      exact: true,
    })
    .click();
  await expect(
    panel.getByRole("button", { name: "Play recorded film", exact: true }),
  ).toBeVisible();
  expect(movieRequests).toBe(0);
  await expect(page.locator("video")).toHaveCount(0);
  await panel
    .getByRole("button", { name: "Play recorded film", exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) =>
          video instanceof HTMLVideoElement ? video.readyState : 0,
        ),
    )
    .toBeGreaterThanOrEqual(2);
  const player = (await page.locator("video").elementHandle())!;
  expect(movieRequests).toBeGreaterThan(0);
  await panel
    .getByRole("button", { name: "Jarvis Bamboo", exact: true })
    .click();
  await expect(page.locator("video")).toHaveCount(0);
  expect(
    await player.evaluate(
      (video) =>
        video instanceof HTMLVideoElement && video.paused && !video.isConnected,
    ),
  ).toBe(true);
  await panel.getByRole("button", { name: "Aeron", exact: true }).click();
  await panel
    .getByRole("button", {
      name: "View Aeron in motion · manufacturer film",
      exact: true,
    })
    .click();
  await panel
    .getByRole("button", { name: "Play recorded film", exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) =>
          video instanceof HTMLVideoElement ? video.readyState : 0,
        ),
    )
    .toBeGreaterThanOrEqual(2);
  const second = (await page.locator("video").elementHandle())!;
  await page.locator("[data-preview-stage]").screenshot({
    path: `test-results/${testInfo.project.name}-fullscreen-inspection.png`,
  });
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  expect(
    await second.evaluate(
      (video) =>
        video instanceof HTMLVideoElement && video.paused && !video.isConnected,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Exit fullscreen preview", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Fullscreen preview", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "First-person view", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("failed photos offer retry and removed items leave inspection in the 2D fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  let failedOnce = false;
  await page.route("**/_next/image?**", async (route) => {
    const url = new URL(route.request().url());
    if (
      !failedOnce &&
      url.searchParams.get("url") === "/product-media/jarvis-bamboo/1.webp" &&
      Number(url.searchParams.get("w")) >= 600
    ) {
      failedOnce = true;
      await route.abort();
    } else await route.continue();
  });
  await page.goto("/");
  await expect(
    page.getByText("2D preview · 3D is unavailable on this device"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  const panel = inspector(page);
  await panel
    .getByRole("button", {
      name: "View Bamboo surface and edge detail",
      exact: true,
    })
    .click();
  await expect(panel.getByText("This media couldn’t load.")).toBeVisible();
  await panel.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    panel.getByRole("img", { name: /Bamboo surface and edge detail/ }),
  ).toBeVisible();
  await expect
    .poll(() =>
      panel
        .getByRole("img", { name: /Bamboo surface and edge detail/ })
        .evaluate((image) =>
          image instanceof HTMLImageElement ? image.naturalWidth : 0,
        ),
    )
    .toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Extras", exact: true }).click();
  await page
    .getByRole("button", { name: "Add FEJKA Rosemary", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "FEJKA Rosemary", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "FEJKA Rosemary", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Remove one FEJKA Rosemary", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "Jarvis Bamboo", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("button", { name: "FEJKA Rosemary", exact: true }),
  ).toHaveCount(0);
});
