// playwright.config.ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // share a single dev server
  forbidOnly: !!process.env.CI,
  retries:    process.env.CI ? 1 : 0,
  workers:    process.env.CI ? 1 : undefined,
  reporter:   [["html", { open: "never" }], ["line"]],

  use: {
    baseURL:       "http://localhost:3000",
    trace:         "on-first-retry",
    screenshot:    "only-on-failure",
    actionTimeout: 10000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 14"] },
    },
  ],

  // Start the Next.js dev server before running tests
  webServer: {
    command:            "npm run dev",
    url:                "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout:            120000,
  },
})
