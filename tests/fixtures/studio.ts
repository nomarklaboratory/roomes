import { test as base } from "@playwright/test";
export { expect, type Page } from "@playwright/test";

// Editor regressions start in Design. Onboarding tests use the unmodified
// Playwright fixture so first visits and migration paths remain exercised.
export const test = base.extend({
  page: async ({ page }, runTest) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "roomes.onboarding.v1",
          JSON.stringify({ version: 1, status: "complete" }),
        );
      } catch {
        /* Blocked-storage tests use the visible Skip action. */
      }
    });
    await runTest(page);
  },
});
