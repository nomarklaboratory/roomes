import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: {
      args: [
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1100 },
      },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm dev --port 3000",
    url: "http://localhost:3000",
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
