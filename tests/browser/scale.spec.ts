import { test, expect } from "../fixtures/studio";

test("catalog and review expose published sizes, preview posture, and unmeasured items", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Select Jarvis Bamboo", exact: true }),
  ).toContainText("120 × 80 × 75 cm");
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
  await page.getByRole("button", { name: "Chairs", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Select Aeron", exact: true }),
  ).toContainText("71.9 × 69.8 × 100.9 cm");
  await expect(
    page.getByRole("button", { name: "Select Sayl", exact: true }),
  ).toContainText("Published dimensions");
  await page.getByRole("button", { name: "Extras", exact: true }).click();
  const extras = page.getByRole("complementary", {
    name: "Personalize your workspace",
  });
  await expect(extras).toContainText("61.2 × 18.9 × 53.6 cm");
  await expect(extras).toContainText("81.3 × 24 × 54.3 cm");
  await expect(extras).toContainText("59 × 22 × 62.5 cm");
  await expect(extras).toContainText("Estimated foliage spread");
  await page
    .getByRole("button", { name: "Add FEJKA Rosemary", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add Twelve South Curve", exact: true })
    .click();
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await expect(page.locator(".room-fallback")).toBeHidden();
  await page.locator("[data-preview-stage]").screenshot({
    path: `test-results/${testInfo.project.name}-catalog-scale.png`,
  });
  await page.getByRole("button", { name: "Review my setup" }).click();
  await expect(page.locator(".review-lines")).toContainText(
    "Estimated foliage spread",
  );
  await expect(page.locator(".review-lines")).toContainText(
    "61.2 × 18.9 × 53.6 cm",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});
