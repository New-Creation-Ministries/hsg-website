import { defineConfig, devices } from "@playwright/test"

import { youtubeFeedNodeOptions } from "./e2e/fixtures/youtube-playwright-env"

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/youtube-feed-failure.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/test-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      YOUTUBE_FEED_MODE_FILE: "",
      NODE_OPTIONS: youtubeFeedNodeOptions(),
    },
  },
})
