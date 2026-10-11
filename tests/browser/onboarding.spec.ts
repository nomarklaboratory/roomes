import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { presetSetup, STORAGE_KEY } from "../../lib/workspace.ts";
import { ONBOARDING_KEY } from "../../lib/stores/rental-brief-store.ts";
import type { Setup } from "../../types/workspace.ts";

const saved = (page: Page): Promise<Setup> =>
  page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).setup,
    STORAGE_KEY,
  );
const briefForm = (page: Page) =>
  page.getByRole("form", { name: "Your rental brief" });

test("one-page brief builds a budget-aware room, prefills checkout, and clears answers after download", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  const modelRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/models/")) modelRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(briefForm(page)).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByLabel("How will your laptop connect?")).toHaveCount(0);
  expect(modelRequests).toEqual([]);
  await page.getByLabel("Where in Bali will you work?").selectOption("Uluwatu");
  const date = (await page
    .getByLabel(/When do you need your setup/)
    .getAttribute("min"))!;
  await page.getByLabel(/When do you need your setup/).fill(date);
  await page.getByLabel("How long do you need it?").selectOption("8");
  await page.getByRole("radio", { name: /Coding & data/ }).check();
  await page
    .getByLabel("How much screen space do you need?")
    .selectOption("dual");
  await page.getByLabel(/weekly equipment budget/).fill("37");
  await page.getByLabel("How will your laptop connect?").selectOption("hdmi");
  await page
    .getByRole("button", { name: "Know your room measurements?" })
    .click();
  await page.getByLabel("Room width (m)").fill("4");
  await page.getByLabel("Room depth (m)").fill("3");
  await page.getByLabel("Room height (m)").fill("2.7");
  await expect(page.locator("[data-brief-weekly]")).toContainText("$37");
  await expect(page.locator("[data-brief-total]")).toHaveText(
    "$296 for 8 weeks",
  );
  await expect(
    page.getByText("A wider desk fits both 27-inch monitors."),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-onboarding.png`,
    fullPage: true,
    scale: "css",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Build my workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Find your flow." }),
  ).toBeFocused();
  await expect(page.locator(".rental-price")).toContainText("$296");
  const setup = await saved(page);
  expect(setup.deskId).toBe("jarvis-laminate");
  expect(setup.chairId).toBe("herman-miller-sayl");
  expect(
    setup.items.filter((item) => item.productId === "dell-u2725qe"),
  ).toHaveLength(2);
  expect(setup.room).toEqual({ width: 4, depth: 3, height: 2.7 });
  const storage = await page.evaluate(() => JSON.stringify(localStorage));
  for (const privateValue of ["Uluwatu", date, "hdmi", "weeklyBudgetCents"])
    expect(storage).not.toContain(privateValue);
  await page.getByRole("link", { name: "Rent this setup" }).click();
  await expect(page.getByLabel("Area", { exact: true })).toHaveValue("Uluwatu");
  await expect(page.getByLabel("Preferred delivery date")).toHaveValue(date);
  await expect(page.locator("[data-checkout-total]")).toHaveText("$296");
  await page.getByLabel("Area", { exact: true }).selectOption("Sanur");
  await page.getByRole("link", { name: "Back to studio" }).click();
  await page.getByRole("button", { name: "Edit rental brief" }).click();
  await expect(page.getByLabel("Where in Bali will you work?")).toHaveValue(
    "Sanur",
  );
  await expect(page.getByLabel(/When do you need your setup/)).toHaveValue(
    date,
  );
  await page.getByRole("button", { name: "Back to my setup" }).click();
  expect(await saved(page)).toEqual(setup);
  await page.getByRole("link", { name: "Rent this setup" }).click();
  await page.getByLabel("Full name").fill("Brief Test");
  await page.getByLabel("Email address").fill("brief@example.com");
  await page.getByLabel("Phone number").fill("+628123456789");
  await page.getByLabel("Delivery address").fill("Test Villa");
  await page.getByRole("button", { name: "Review rental request" }).click();
  await expect(page.getByText(/Laptop connection: HDMI/)).toBeVisible();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save rental request" }).click();
  const request = JSON.parse(
    await readFile((await (await downloading).path())!, "utf8"),
  );
  expect(request.preferences.laptopConnection).toBe("hdmi");
  expect(request.preferences.compatibilityVerified).toBe(false);
  expect(request.delivery.area).toBe("Sanur");
  expect(request.totalCents).toBe(29600);
  await expect(
    page.getByRole("heading", { name: "Your request is ready." }),
  ).toBeFocused();
  await expect(page.getByText("Brief Test", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Back to your workspace" }).click();
  await page.getByRole("button", { name: "Edit rental brief" }).click();
  await expect(page.getByLabel("Where in Bali will you work?")).toHaveValue("");
  await expect(page.getByLabel(/When do you need your setup/)).toHaveValue("");
  await expect(page.getByLabel(/weekly equipment budget/)).toHaveValue("");
  expect(errors).toEqual([]);
});

test("unfinished first visits return to the brief, while skip and completed visits resume the designer", async ({
  page,
}) => {
  await page.goto("/");
  await expect(briefForm(page)).toBeVisible();
  await page.getByLabel(/weekly equipment budget/).fill("25");
  await page.reload();
  await expect(briefForm(page)).toBeVisible();
  await expect(page.getByLabel(/weekly equipment budget/)).toHaveValue("");
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).status,
      ONBOARDING_KEY,
    ),
  ).toBe("pending");
  await page
    .getByRole("button", { name: "Skip rental brief", exact: true })
    .click();
  await expect(page.locator(".rental-price")).toContainText("$108");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Edit rental brief" }),
  ).toBeVisible();
  await expect(briefForm(page)).toHaveCount(0);
  const original = await saved(page);
  await page.getByRole("button", { name: "Edit rental brief" }).click();
  await page.getByLabel("How long do you need it?").selectOption("1");
  await page.getByRole("button", { name: "Back to my setup" }).click();
  expect(await saved(page)).toEqual(original);
});

test("brief validation focuses errors and impossible budgets retain both requested monitors", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(briefForm(page)).toBeVisible();
  await page.getByLabel(/When do you need your setup/).fill("2000-01-01");
  await page.getByLabel(/weekly equipment budget/).fill("0");
  await page.getByRole("button", { name: "Build my workspace" }).click();
  await expect(page.getByLabel(/When do you need your setup/)).toBeFocused();
  await expect(briefForm(page).getByRole("alert")).toBeVisible();
  await page.getByLabel(/When do you need your setup/).fill("");
  await page.getByRole("button", { name: "Build my workspace" }).click();
  await expect(page.getByLabel(/weekly equipment budget/)).toBeFocused();
  await page.getByLabel(/weekly equipment budget/).fill("30");
  await page
    .getByLabel("How much screen space do you need?")
    .selectOption("dual");
  await page
    .getByRole("button", { name: "Know your room measurements?" })
    .click();
  await page.getByLabel("Room width (m)").fill("1");
  await page.getByRole("button", { name: "Build my workspace" }).click();
  await expect(page.getByLabel("Room width (m)")).toBeFocused();
  await page.getByLabel("Room width (m)").fill("3");
  await expect(page.getByText(/\$7 \/ week over your budget/)).toBeVisible();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-onboarding-budget.png`,
    fullPage: true,
    scale: "css",
  });
  await page.getByRole("button", { name: "Build my workspace" }).click();
  await expect(page.locator(".rental-price")).toContainText("$148");
  expect(
    (await saved(page)).items.filter(
      (item) => item.productId === "dell-u2725qe",
    ),
  ).toHaveLength(2);
});

test("saved rooms still open first-visit onboarding and suggestions remain undoable", async ({
  page,
}) => {
  const setup = {
    ...presetSetup("developer"),
    weeks: 8 as const,
    room: { width: 4.6, depth: 4, height: 3 },
  };
  await page.addInitScript(
    ({ key, setup }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify({ version: 2, setup }));
    },
    { key: STORAGE_KEY, setup },
  );
  await page.goto("/");
  await expect(briefForm(page)).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  const restored = await saved(page);
  expect(restored.room).toEqual(setup.room);
  expect(restored.weeks).toBe(8);
  await page
    .getByRole("button", { name: "Skip rental brief", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Edit rental brief" }),
  ).toBeVisible();
  await expect(briefForm(page)).toHaveCount(0);
  expect(await saved(page)).toEqual(restored);
  await page.getByRole("button", { name: "Edit rental brief" }).click();
  await page.getByRole("radio", { name: /Design & content/ }).check();
  await page.getByRole("button", { name: "Use suggested setup" }).click();
  await expect(page.locator(".rental-price")).toContainText("$272");
  expect((await saved(page)).room).toEqual(setup.room);
  await page.getByRole("button", { name: /^Open product catalog/ }).click();
  const catalog = page.getByRole("dialog", { name: "Make it yours." });
  await catalog.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => saved(page)).toEqual(restored);
  await catalog.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Edit rental brief" }),
  ).toBeVisible();
  expect(await saved(page)).toEqual(restored);
});

test("keyboard choices update the suggestion and expired delivery preferences are revalidated", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-03T08:00:00+08:00") });
  await page.goto("/");
  await expect(briefForm(page)).toBeVisible();
  const everyday = page.getByRole("radio", { name: /Everyday work/ });
  await everyday.focus();
  await everyday.press("ArrowDown");
  await expect(
    page.getByRole("radio", { name: /Coding & data/ }),
  ).toBeChecked();
  await expect(page.locator("[data-brief-weekly]")).toContainText("$27");
  await page.getByLabel("Where in Bali will you work?").selectOption("Canggu");
  await page.getByLabel(/When do you need your setup/).fill("2026-11-04");
  await page.getByRole("button", { name: "Build my workspace" }).click();
  await page.clock.setSystemTime(new Date("2026-11-04T08:00:00+08:00"));
  await page.getByRole("link", { name: "Rent this setup" }).click();
  const date = page.getByLabel("Preferred delivery date");
  await expect(date).toHaveValue("2026-11-04");
  await expect(date).toHaveAttribute("min", "2026-11-05");
  await page.getByLabel("Full name").fill("Date Test");
  await page.getByLabel("Email address").fill("date@example.com");
  await page.getByLabel("Phone number").fill("+628123456789");
  await page.getByLabel("Delivery address").fill("Test Villa");
  await page.getByRole("button", { name: "Review rental request" }).click();
  await expect(date).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Your rental request" }),
  ).toHaveCount(0);
  await date.fill("2026-11-05");
  await page.getByRole("button", { name: "Review rental request" }).click();
  await expect(
    page.getByRole("heading", { name: "Your rental request" }),
  ).toBeVisible();
});

test("blocked storage and unavailable WebGL still allow briefing, editing and checkout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new Error("Blocked");
      },
    });
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (["webgl", "webgl2", "experimental-webgl"].includes(type)) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/");
  await expect(briefForm(page)).toBeVisible();
  await page.getByLabel("Where in Bali will you work?").selectOption("Canggu");
  await page.getByRole("radio", { name: /Coding & data/ }).check();
  await page.getByLabel(/weekly equipment budget/).fill("23");
  await page.getByRole("button", { name: "Build my workspace" }).click();
  await expect(
    page.getByText("2D preview · 3D is unavailable on this device"),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Device storage unavailable. Changes will last for this tab.",
    ),
  ).toBeVisible();
  await page.getByRole("link", { name: "Rent this setup" }).click();
  await expect(page.getByLabel("Area", { exact: true })).toHaveValue("Canggu");
  await expect(page.locator("[data-checkout-total]")).toHaveText("$88");
  await page.getByRole("link", { name: "Back to studio" }).click();
  await expect(page.locator(".rental-price")).toContainText("$88");
  expect(errors).toEqual([]);
});
