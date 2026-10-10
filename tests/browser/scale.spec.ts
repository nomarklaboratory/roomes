import { test, expect } from "@playwright/test";

test("catalog and review expose published sizes, preview posture, and unmeasured items", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Select Electric desk", exact: true }),
  ).toContainText("120 × 60 × 75 cm");
  await page.getByRole("button", { name: "Desk", exact: true }).click();
  await page
    .getByText("Dimensions & source · Electric desk", { exact: true })
    .click();
  await expect(page.locator("details[open]")).toContainText(
    "Preview set at 75 cm",
  );
  await expect(
    page.getByRole("link", { name: /View dimension source/ }),
  ).toHaveAttribute(
    "href",
    "https://www.monis.rent/products/electrical-adjustable-desk",
  );
  await page.getByRole("button", { name: "Close movement controls" }).click();
  await page.getByRole("button", { name: "Chairs", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Select Ergonomic chair", exact: true }),
  ).toContainText("65 × 66 × 115 cm");
  await expect(
    page.getByRole("button", { name: "Select Everyday chair", exact: true }),
  ).toContainText("Concept dimensions");
  await page.getByRole("button", { name: "Extras", exact: true }).click();
  const extras = page.locator(".extras-list");
  await expect(extras).toContainText("61.3 × 20 × 51.5 cm");
  await expect(extras).toContainText("81 × 24.3 × 52.1 cm");
  await expect(extras).toContainText("15 × 44 × 42 cm");
  await expect(extras).toContainText("Estimated dimensions");
  await page
    .getByRole("button", { name: "Add Laptop stand", exact: true })
    .click();
  await expect(page.locator(".loading-panel")).toHaveCount(0, {
    timeout: 45000,
  });
  await expect(page.locator(".room-fallback")).toBeHidden();
  await page.locator(".preview-stage").screenshot({
    path: `test-results/${testInfo.project.name}-catalog-scale.png`,
  });
  await page.getByRole("button", { name: "Review my setup" }).click();
  await expect(page.locator(".review-lines")).toContainText(
    "Estimated dimensions",
  );
  await expect(page.locator(".review-lines")).toContainText(
    "61.3 × 20 × 51.5 cm",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});
