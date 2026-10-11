import { test, expect } from "../fixtures/studio";
import { readFile } from "node:fs/promises";
import {
  initialHistory,
  reducer,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "../../lib/workspace.ts";

const extraIds = [
  "logitech-desk-mat",
  "logitech-mouse-pad",
  "logitech-mx-keys-mini",
  "logitech-mx-master-3s",
  "elgato-stream-deck-mk2",
];

test("rent navigates to checkout, reviews delivery details, downloads the correct request and preserves the studio", async ({
  page,
}, testInfo) => {
  let state = initialHistory();
  for (const productId of extraIds)
    state = reducer(state, { type: "add", id: productId, productId });
  state = reducer(state, {
    type: "place",
    id: "desk",
    position: { x: 0.3, z: -0.2 },
  });
  const setup = state.present;
  await page.addInitScript(
    ({ key, value }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    {
      key: STORAGE_KEY,
      value: JSON.stringify({ version: STORAGE_VERSION, setup }),
    },
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Rent this setup" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(
    page.getByRole("heading", { name: "Make room for good work." }),
  ).toBeVisible();
  const summary = page.getByRole("complementary", { name: "Order summary" });
  await expect(
    summary.getByText("MX Keys Mini", { exact: true }),
  ).toBeVisible();
  await expect(
    summary.getByText("Stream Deck MK.2", { exact: true }),
  ).toBeVisible();
  await summary.getByRole("button", { name: "8 weeks", exact: true }).click();
  await expect(page.locator("[data-checkout-total]")).toHaveText("$320");
  await page.getByLabel("Full name").fill("Alex Test");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByLabel("Phone number").fill("+628123456789");
  await page.getByLabel("Area", { exact: true }).selectOption("Canggu");
  const date = await page
    .getByLabel("Preferred delivery date")
    .getAttribute("min");
  expect(date).toBeTruthy();
  await page.getByLabel("Preferred delivery date").fill(date!);
  await page.getByLabel("Delivery address").fill("Jalan Test 1\nUnit 3");
  await page.getByLabel(/Delivery notes/).fill("Call when you arrive.");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-checkout.png`,
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
  const smallText = await page
    .locator("main :is(label,p,button,dt,dd,a,input,select,textarea)")
    .evaluateAll((elements) =>
      elements
        .filter(
          (element) => parseFloat(getComputedStyle(element).fontSize) < 16,
        )
        .map((element) => element.textContent),
    );
  expect(smallText).toEqual([]);
  await page.getByRole("button", { name: "Review rental request" }).click();
  await expect(
    page.getByRole("heading", { name: "Your rental request" }),
  ).toBeVisible();
  await expect(page.getByText("Alex Test", { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save rental request" }).click();
  const download = await downloadPromise;
  const request = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(request.totalCents).toBe(32000);
  expect(request.weeks).toBe(8);
  expect(request.delivery.email).toBe("alex@example.com");
  expect(request.setup.layout).toEqual(setup.layout);
  await expect(
    page.getByRole("link", { name: "Download your blueprint" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Download your blueprint" }).click();
  await expect(page).toHaveURL(/\/blueprint$/);
  const blueprintDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  expect((await blueprintDownload).suggestedFilename()).toBe(
    "monis-setup-blueprint.pdf",
  );
  const stored = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  expect(stored).not.toContain("alex@example.com");
  await page.getByRole("link", { name: "Back to studio" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("button", { name: "8 weeks", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByText("Your setup saves as you go")).toBeVisible();
  const restored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).setup,
    STORAGE_KEY,
  );
  expect(restored.items).toEqual(setup.items);
  expect(restored.layout).toEqual(setup.layout);
  expect(restored.weeks).toBe(8);
  expect(errors).toEqual([]);
});
