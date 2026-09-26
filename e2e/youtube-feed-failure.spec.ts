import { writeFileSync } from "node:fs"

import { expect, test, type Locator, type Page } from "@playwright/test"

import {
  sermonPlaylistId,
  sermonPlaylistUnavailable,
  sermonPlaylistUrl,
} from "../src/content/home"
import {
  blurb,
  churchName,
  footerAddress,
  ministryName,
  navLabels,
  scripture,
  scriptureRef,
  sections,
  sundayNote,
  testimonySource,
} from "./copy"
import {
  expectNoHorizontalScroll,
  headerNav,
} from "./helpers"

const PLAYLIST_URL = sermonPlaylistUrl(sermonPlaylistId)
const FAILURE_MODES = [
  "404",
  "500",
  "network",
  "malformed",
  "stalled-headers",
  "stalled-body",
] as const

const FIXTURE_VIDEO_TITLES = [
  "Fixture sermon one",
  "Fixture sermon two",
  "Fixture sermon three",
  "Fixture sermon four",
  "Fixture sermon five",
] as const

const wide = { width: 1440, height: 900 }
const narrow = { width: 390, height: 844 }

const STALL_NAVIGATION_TIMEOUT_MS = 20_000

function modeFilePath(): string {
  const path = process.env.YOUTUBE_FEED_MODE_FILE
  if (!path) {
    throw new Error("YOUTUBE_FEED_MODE_FILE is not set by playwright.youtube.config.ts")
  }
  return path
}

function setFeedMode(mode: string) {
  writeFileSync(modeFilePath(), `${mode}\n`, "utf8")
}

function sermonsRegion(page: Page) {
  return page.getByRole("region", { name: "Sermons" })
}

function fallbackLink(sermons: Locator) {
  return sermons.getByRole("link", {
    name: sermonPlaylistUnavailable.linkLabel,
  })
}

async function gotoHome(page: Page, options?: { timeout?: number }) {
  const response = await page.goto("/", {
    waitUntil: "domcontentloaded",
    timeout: options?.timeout,
  })
  expect(response, "Home navigation response").not.toBeNull()
  expect(response!.status(), "Home HTTP status").toBe(200)
  return response!
}

async function expectUnavailableSermons(page: Page) {
  const sermons = sermonsRegion(page)
  await expect(
    sermons.getByRole("heading", { level: 2, name: "Sermons" }),
  ).toBeVisible()
  await expect(sermons.getByRole("link", { name: "Watch" })).toHaveAttribute(
    "href",
    "/watch",
  )
  const quote = sermons.locator("blockquote.scripture")
  await expect(quote.getByRole("paragraph")).toHaveText(scripture)
  await expect(quote.locator("footer")).toHaveText(scriptureRef)
  await expect(sermons.getByText(sermonPlaylistUnavailable.message)).toBeVisible()
  const link = fallbackLink(sermons)
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute("href", PLAYLIST_URL)
  await expect(link).toHaveAttribute("target", "_blank")
  await expect(link).toHaveAttribute("rel", "noopener noreferrer")
  await expect(link.locator("img")).toHaveAttribute(
    "src",
    "/sermons/playlist-placeholder.jpg",
  )
  await expect(
    sermons.locator('a[href^="https://www.youtube.com/watch?v="]'),
  ).toHaveCount(0)
  await expect(sermons.getByText("Playlist to be published")).toHaveCount(0)
  await expect(
    sermons.getByText(
      /youtube_playlist_read_failed|invalid-feed|YoutubePlaylistReadError|external_read_failed|ExternalReadError/i,
    ),
  ).toHaveCount(0)
  await expect(sermons.getByRole("button", { name: /retry/i })).toHaveCount(0)
}

async function expectAvailableSermons(page: Page) {
  const sermons = sermonsRegion(page)
  await expect(sermons.getByText(sermonPlaylistUnavailable.message)).toHaveCount(0)
  await expect(fallbackLink(sermons)).toHaveCount(0)
  const videoLinks = sermons.locator('a[href^="https://www.youtube.com/watch?v="]')
  await expect(videoLinks).toHaveCount(5)
  for (let i = 0; i < FIXTURE_VIDEO_TITLES.length; i += 1) {
    const title = FIXTURE_VIDEO_TITLES[i]!
    const link = sermons.getByRole("link", { name: title })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute(
      "href",
      `https://www.youtube.com/watch?v=fix00${i + 1}`,
    )
  }
  await expect(sermons.getByRole("link", { name: "Fixture sermon six" })).toHaveCount(0)
}

async function expectSurroundingHome(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: churchName })).toBeVisible()
  await expect(page.getByText(blurb)).toBeVisible()
  for (const name of sections) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible()
  }
  await expect(page.getByText(testimonySource)).toBeVisible()
  await expect(page.getByText(sundayNote)).toBeVisible()
  await expect(page.getByText(ministryName)).toBeVisible()
  await expect(page.getByText(footerAddress)).toBeVisible()
  await expect(page.getByRole("contentinfo")).toBeVisible()

  const menu = page.getByRole("button", { name: "Menu" })
  const nav = headerNav(page)
  if (await menu.isVisible()) {
    await expect(menu).toBeVisible()
    await menu.click()
    await expect(nav.getByRole("link")).toHaveText([...navLabels])
    await menu.click()
  } else {
    await expect(nav.getByRole("link")).toHaveText([...navLabels])
  }
}

async function expectVisibleFocus(locator: Locator) {
  await expect(locator).toBeFocused()
  const outline = await locator.evaluate((el) => {
    const style = getComputedStyle(el)
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      outlineColor: style.outlineColor,
    }
  })
  expect(outline.outlineStyle).not.toBe("none")
  expect(Number.parseFloat(outline.outlineWidth)).toBeGreaterThan(0)
}

async function attachScreenshot(
  page: Page,
  testInfo: { attach: (name: string, options: { body: Buffer; contentType: string }) => Promise<void> },
  name: string,
) {
  await page.evaluate(() => {
    const header = document.querySelector(".site-header")
    if (header instanceof HTMLElement) header.style.position = "relative"
    window.scrollTo(0, 0)
  })
  const body = await page.screenshot({ fullPage: true })
  await page.evaluate(() => {
    const header = document.querySelector(".site-header")
    if (header instanceof HTMLElement) header.style.position = ""
  })
  await testInfo.attach(name, { body, contentType: "image/png" })
}

test.describe.configure({ mode: "serial" })

test.describe("YouTube playlist feed failure isolation", () => {
  test.afterEach(() => {
    setFeedMode("success")
  })

  for (const mode of FAILURE_MODES) {
    test(`returns HTTP 200 with unavailable Sermons for mode ${mode}`, async ({
      page,
    }) => {
      setFeedMode(mode)
      const timeout =
        mode.startsWith("stalled") ? STALL_NAVIGATION_TIMEOUT_MS : undefined
      await page.setViewportSize(wide)
      await gotoHome(page, { timeout })
      await expectUnavailableSermons(page)
      await expectSurroundingHome(page)
    })
  }

  test("recovers to five fixture videos after switching failure to success on the same server", async ({
    page,
  }) => {
    setFeedMode("404")
    await page.setViewportSize(wide)
    await gotoHome(page)
    await expectUnavailableSermons(page)

    setFeedMode("success")
    await gotoHome(page)
    await expectAvailableSermons(page)
    await expectSurroundingHome(page)
  })

  for (const viewport of [
    { name: "1440px", size: wide },
    { name: "390px", size: narrow },
  ] as const) {
    test(`keeps layout, overflow, and keyboard focus at ${viewport.name} during failure`, async ({
      page,
    }, testInfo) => {
      setFeedMode("500")
      await page.setViewportSize(viewport.size)
      await gotoHome(page)
      await expectUnavailableSermons(page)
      await expectSurroundingHome(page)
      await expectNoHorizontalScroll(page)

      const sermons = sermonsRegion(page)
      await expect(sermons.locator("blockquote.scripture")).toBeVisible()
      await sermons.getByRole("link", { name: "Watch" }).focus()
      await page.keyboard.press("Tab")
      const link = fallbackLink(sermons)
      await expectVisibleFocus(link)
      await attachScreenshot(
        page,
        testInfo,
        `failure-${viewport.name}-focus.png`,
      )
    })

    test(`captures success and failure screenshots at ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      setFeedMode("success")
      await page.setViewportSize(viewport.size)
      await gotoHome(page)
      await expectAvailableSermons(page)
      await attachScreenshot(page, testInfo, `success-${viewport.name}.png`)

      setFeedMode("network")
      await gotoHome(page)
      await expectUnavailableSermons(page)
      await attachScreenshot(page, testInfo, `failure-${viewport.name}.png`)
    })
  }

  test("Watch reaches /watch during failure and fallback stays on-site without opening YouTube", async ({
    page,
  }) => {
    setFeedMode("malformed")
    await page.setViewportSize(wide)
    await gotoHome(page)
    await expectUnavailableSermons(page)

    const sermons = sermonsRegion(page)
    await sermons.getByRole("link", { name: "Watch" }).click()
    await expect(page).toHaveURL(/\/watch\/?$/)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

    await page.goto("/")
    await expectUnavailableSermons(page)

    const link = fallbackLink(sermonsRegion(page))
    await expect(link).toHaveAttribute("href", PLAYLIST_URL)
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute("rel", "noopener noreferrer")

    let youtubeNavigations = 0
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame() && frame.url().includes("youtube.com")) {
        youtubeNavigations += 1
      }
    })
    await expect(page).toHaveURL(/\/$/)
    expect(youtubeNavigations).toBe(0)
  })
})
