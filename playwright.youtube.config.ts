import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { defineConfig, devices } from "@playwright/test"

import { youtubeFeedNodeOptions } from "./e2e/fixtures/youtube-playwright-env"

function allocateModeFile(): { modeDir: string; modeFile: string; created: boolean } {
  const existingFile = process.env.YOUTUBE_FEED_MODE_FILE
  if (existingFile) {
    return {
      modeDir: process.env.YOUTUBE_FEED_MODE_DIR ?? dirname(existingFile),
      modeFile: existingFile,
      created: false,
    }
  }
  const modeDir = mkdtempSync(join(tmpdir(), "hsg-youtube-feed-"))
  const modeFile = join(modeDir, "mode")
  writeFileSync(modeFile, "success\n", "utf8")
  process.env.YOUTUBE_FEED_MODE_DIR = modeDir
  process.env.YOUTUBE_FEED_MODE_FILE = modeFile
  return { modeDir, modeFile, created: true }
}

const { modeDir, modeFile, created: createdModeDir } = allocateModeFile()

function cleanupModeDir() {
  if (!createdModeDir) return
  try {
    rmSync(modeDir, { recursive: true, force: true })
  } catch {
    // already removed
  }
}

process.on("exit", cleanupModeDir)

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/youtube-feed-failure.spec.ts"],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/youtube-test-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      YOUTUBE_FEED_MODE_DIR: modeDir,
      YOUTUBE_FEED_MODE_FILE: modeFile,
      NODE_OPTIONS: youtubeFeedNodeOptions(),
    },
  },
})
