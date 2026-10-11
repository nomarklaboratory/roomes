import { test, expect } from "../fixtures/studio";

const products = [
  "Studio Desk Mat",
  "Studio Mouse Pad",
  "MX Keys Mini",
  "MX Master 3S",
  "Stream Deck MK.2",
];

test("new extras can be added, inspected with local official photos, removed and restored", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("Your setup saves as you go")).toBeVisible();
  await page.getByRole("button", { name: /Open product catalog/ }).click();
  const catalog = page.getByRole("dialog", { name: "Make it yours." });
  await catalog.getByRole("button", { name: "Extras", exact: true }).click();
  for (const name of products) {
    await catalog
      .getByRole("button", { name: `Add ${name}`, exact: true })
      .click();
    await expect(
      catalog.getByRole("button", { name: `Remove one ${name}`, exact: true }),
    ).toBeVisible();
    const photo = catalog.getByRole("img", { name, exact: true });
    await expect
      .poll(() =>
        photo.evaluate(
          (img) =>
            img instanceof HTMLImageElement &&
            img.complete &&
            img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-extras.png`,
  });
  const smallText = await catalog
    .locator("p, small, span, button")
    .evaluateAll((elements) =>
      elements
        .filter(
          (element) => parseFloat(getComputedStyle(element).fontSize) < 16,
        )
        .map((element) => element.textContent),
    );
  expect(smallText).toEqual([]);
  await catalog.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await expect(page.locator("canvas")).toBeVisible();
  await page
    .locator("[data-preview-stage]")
    .screenshot({
      path: `test-results/${testInfo.project.name}-extras-preview.png`,
    });
  await page.getByRole("button", { name: "MX Keys Mini", exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect product", exact: true })
    .click();
  const inspector = page.getByRole("dialog", {
    name: "Real product inspection",
  });
  await expect(
    inspector.getByRole("heading", { name: "MX Keys Mini", exact: true }),
  ).toBeVisible();
  await expect(
    inspector.getByRole("link", { name: "View official product" }),
  ).toHaveAttribute(
    "href",
    "https://www.logitech.com/en-us/shop/p/mx-keys-mini",
  );
  await inspector
    .getByRole("button", {
      name: "View Compact profile and sculpted keys",
      exact: true,
    })
    .click();
  await expect(
    inspector
      .getByRole("img", { name: /Compact profile and sculpted keys/ })
      .first(),
  ).toBeVisible();
  await inspector
    .getByRole("button", { name: "Reviews (3)", exact: true })
    .click();
  await expect(
    inspector.getByText("More space for everything else", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Open product catalog/ }).click();
  await catalog
    .getByRole("button", { name: "Remove one Studio Mouse Pad", exact: true })
    .click();
  await catalog.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    catalog.getByRole("button", {
      name: "Remove one Studio Mouse Pad",
      exact: true,
    }),
  ).toBeVisible();
  await catalog.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await expect(page.getByText("Your setup saves as you go")).toBeVisible();
  const setup = await page.evaluate(
    () => JSON.parse(localStorage.getItem("roomes.workspace.v1")!).setup,
  );
  expect(setup.items.length).toBe(7);
  expect(
    setup.items.every(
      (item: { slot: string }) => typeof item.slot === "string",
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
