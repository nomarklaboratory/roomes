import {
  test,
  expect,
  openCatalog,
  closeCatalog,
  waitForScene,
} from "../fixtures/studio";

test("catalog and placement details expose published sizes, preview posture, and unmeasured items", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const desks = await openCatalog(page);
  await expect(
    desks.getByRole("button", { name: "Select Jarvis Bamboo", exact: true }),
  ).toContainText("120 × 80 × 75 cm");
  await closeCatalog(page);
  await page.getByRole("button", { name: "Desk", exact: true }).click();
  await page
    .getByText("Dimensions & source · Jarvis Bamboo", { exact: true })
    .click();
  await expect(page.locator("details[open]")).toContainText("Preview at 75 cm");
  await expect(
    page.getByRole("link", { name: /View dimension source/ }),
  ).toHaveAttribute(
    "href",
    "https://ukstore.hermanmiller.com/products/jarvis-bamboo-standing-desk",
  );
  await page.getByRole("button", { name: "Close movement controls" }).click();
  const catalog = await openCatalog(page);
  await catalog.getByRole("button", { name: "Chairs", exact: true }).click();
  await expect(
    catalog.getByRole("button", { name: "Select Aeron", exact: true }),
  ).toContainText("71.9 × 69.8 × 100.9 cm");
  await expect(
    catalog.getByRole("button", { name: "Select Sayl", exact: true }),
  ).toContainText("Published dimensions");
  await catalog.getByRole("button", { name: "Extras", exact: true }).click();
  await expect(catalog).toContainText("61.2 × 18.9 × 53.6 cm");
  await expect(catalog).toContainText("81.3 × 24 × 54.3 cm");
  await expect(catalog).toContainText("59 × 22 × 62.5 cm");
  await expect(catalog).toContainText("Estimated foliage spread");
  await catalog
    .getByRole("button", { name: "Add FEJKA Rosemary", exact: true })
    .click();
  await catalog
    .getByRole("button", { name: "Add Twelve South Curve", exact: true })
    .click();
  await closeCatalog(page);
  await waitForScene(page);
  await expect(page.locator(".room-fallback")).toBeHidden();
  await page.locator("[data-preview-stage]").screenshot({
    path: `test-results/${testInfo.project.name}-catalog-scale.png`,
  });
  await page
    .locator(".item-chips")
    .getByRole("button", { name: "FEJKA Rosemary", exact: true })
    .click();
  await expect(page.locator(".placement-panel")).toContainText(
    "FEJKA Rosemary",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});
