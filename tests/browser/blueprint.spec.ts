import { test, expect, type Page } from "../fixtures/studio";
import { readFile } from "node:fs/promises";
import {
  initialHistory,
  reducer,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "../../lib/workspace.ts";

async function withoutWebGL(page: Page) {
  await page.addInitScript(() => {
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
}

test("precise placement validates each field, matches blueprint distances, persists and undoes", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await withoutWebGL(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Desk", exact: true }).click();
  const position = page.getByRole("form", { name: "Precise product position" });
  const left = position.getByLabel("From left wall (cm)");
  const back = position.getByLabel("From back wall (cm)");
  await left.fill("");
  await back.fill("5000");
  await position.getByRole("button", { name: "Apply position" }).click();
  await expect(left).toBeFocused();
  await expect(left).toHaveAttribute("aria-invalid", "true");
  await expect(back).toHaveAttribute("aria-invalid", "true");
  await left.fill("50");
  await expect(left).toHaveAttribute("aria-invalid", "false");
  await expect(back).toHaveAttribute("aria-invalid", "true");
  await back.fill("70");
  await position.getByRole("button", { name: "Apply position" }).click();
  const after = await page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );
  expect(after.layout.desk).toEqual({ x: -0.7, z: -0.45 });
  await page.getByRole("link", { name: "Blueprint", exact: true }).click();
  await expect(page).toHaveURL(/\/blueprint$/);
  const products = page.getByRole("list", { name: "Blueprint products" });
  await expect(products.getByRole("button").first()).toContainText(
    "Left wall edge: 50 cm",
  );
  await expect(products.getByRole("button").first()).toContainText(
    "Back edge: 70 cm",
  );
  await page.getByRole("tab", { name: "Desk plan" }).click();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-blueprint.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(
    await page
      .locator("main :is(p,button,a)")
      .evaluateAll(
        (elements) =>
          elements.filter(
            (element) => parseFloat(getComputedStyle(element).fontSize) < 14,
          ).length,
      ),
  ).toBe(0);
  await page.getByRole("link", { name: "Back to studio" }).click();
  await expect(position.getByLabel("From left wall (cm)")).toHaveValue("50");
  await page.getByRole("button", { name: /^Open product catalog/ }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  const undone = await page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );
  expect(undone.layout.desk).toEqual({ x: 0, z: -0.43 });
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Desk", exact: true }).click();
  await left.fill("50");
  await back.fill("70");
  await position.getByRole("button", { name: "Apply position" }).click();
  await page.getByRole("link", { name: "Blueprint", exact: true }).click();
  await expect(page).toHaveURL(/\/blueprint$/);
  await page.reload();
  await expect(products.getByRole("button").first()).toContainText(
    "Left wall edge: 50 cm",
  );
  expect(errors).toEqual([]);
});

test("wall blueprint selects numbered products, exports a vector PDF, and survives export failures", async ({
  page,
}) => {
  let state = initialHistory();
  for (const productId of [
    "torq-mod-fun",
    "logitech-desk-mat",
    "logitech-mx-master-3s",
  ])
    state = reducer(state, { type: "add", id: productId, productId });
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    {
      key: STORAGE_KEY,
      value: JSON.stringify({ version: STORAGE_VERSION, setup: state.present }),
    },
  );
  await page.goto("/blueprint");
  await page.getByRole("tab", { name: "Back wall" }).click();
  const board = page
    .getByRole("list", { name: "Blueprint products" })
    .getByRole("button", { name: /Torq Mod Fun/ });
  await board.click();
  await expect(board).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator("svg").getByRole("button", { name: /Torq Mod Fun/ }),
  ).toHaveAttribute("aria-pressed", "true");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("monis-setup-blueprint.pdf");
  const pdf = await readFile((await download.path())!);
  await download.saveAs("test-results/blueprint.pdf");
  expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  expect(pdf.toString()).toContain("Bottom from floor");
  expect(pdf.toString()).not.toContain("/Subtype /Image");
  await expect(
    page.getByText("Your blueprint PDF has been downloaded."),
  ).toBeVisible();
  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error("Download blocked");
    };
  });
  await page.getByRole("button", { name: "Download PDF" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Could not download the PDF",
  );
  await expect(board).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download PDF" }),
  ).toBeEnabled();
});

test("checkout focuses its first error, keeps unrelated errors, and preserves values on download failure", async ({
  page,
}) => {
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Review rental request" }).click();
  await expect(page.getByLabel("Full name")).toBeFocused();
  await page.getByLabel("Full name").fill("Alex Test");
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByLabel("Phone number").fill("+628123456789");
  await page.getByLabel("Area", { exact: true }).selectOption("Canggu");
  const date = page.getByLabel("Preferred delivery date");
  await date.fill((await date.getAttribute("min"))!);
  await page.getByLabel("Delivery address").fill("Villa 1");
  await page.getByRole("button", { name: "Review rental request" }).click();
  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error("Download blocked");
    };
  });
  await page.getByRole("button", { name: "Save rental request" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Your details are still here",
  );
  await page.getByRole("button", { name: "Edit details" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Alex Test");
  await expect(page.getByLabel("Email address")).toHaveValue(
    "alex@example.com",
  );
});
