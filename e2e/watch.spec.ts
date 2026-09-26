import { expect, test, type Page } from "@playwright/test"

import {
  featuredTestimoniesScripture,
  playlistThemes,
  testimonies,
} from "../src/content/watch"
import { YOUTUBE_LIVE_OFFLINE_COPY } from "../src/lib/youtube-live"
import { churchName, shellSentence } from "./copy"
import fixtureVideos from "./fixtures/youtube-fixture-videos.json"
import { box, desktop, headerNav, phone } from "./helpers"
const FIXTURE_VIDEO_TITLES = fixtureVideos.prefix.map((video) => video.title)

const ACID = "rgb(222, 231, 127)"

function freeSermonsRow(page: Page) {
  return page.getByRole("region", { name: "Free sermons" })
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktop)
})

test("opens Watch with no ongoing service and no on-page players", async ({ page }) => {
  await page.goto("/watch")

  await expect(page).toHaveTitle(`Watch | ${churchName}`)
  await expect(page.getByText(shellSentence)).toHaveCount(0)
  await expect(page.getByText(YOUTUBE_LIVE_OFFLINE_COPY)).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Live", exact: true })).toHaveCount(0)
  await expect(page.locator(".watch-live")).toHaveCount(0)
  await expect(page.getByRole("heading", { level: 1, name: "4th Stage Lung Cancer Healed" })).toBeVisible()
  await expect(page.getByRole("heading", { level: 1, name: "Watch" })).toHaveCount(0)
  await expect(headerNav(page).getByRole("link", { name: "Watch", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
  await expect(page.locator("iframe")).toHaveCount(0)
  await expect(page.locator('script[src*="youtube.com"]')).toHaveCount(0)
  await expect(page.locator('script[src*="instagram.com"]')).toHaveCount(0)
})

test("places Hebrews 2:4 after Featured Testimonies heading and before items", async ({ page }) => {
  await page.goto("/watch")

  const region = page.getByRole("region", { name: "Featured Testimonies" })
  const heading = region.getByRole("heading", { level: 2, name: "Featured Testimonies" })
  const citation = region.getByRole("heading", {
    level: 3,
    name: featuredTestimoniesScripture.citation,
  })
  const verse = region.getByText(`“${featuredTestimoniesScripture.text}”`)
  const firstTestimony = region.getByRole("heading", {
    level: 1,
    name: testimonies[0]!.name,
  })

  await expect(heading).toBeVisible()
  await expect(citation).toBeVisible()
  await expect(verse).toBeVisible()
  await expect(region.getByRole("link", { name: featuredTestimoniesScripture.citation })).toHaveCount(0)
  await expect(region.locator(".watch-scripture a")).toHaveCount(0)

  expect((await box(heading)).y).toBeLessThan((await box(citation)).y)
  expect((await box(citation)).y).toBeLessThan((await box(firstTestimony)).y)
  expect((await box(verse)).y).toBeLessThan((await box(firstTestimony)).y)

  const scriptureBox = await box(region.locator(".watch-scripture"))
  const regionBox = await box(region)
  expect(scriptureBox.width).toBeGreaterThan(regionBox.width * 0.7)
})

test("scrolls four testimonies, each with name, writeup, and photo", async ({ page }) => {
  await page.goto("/watch")

  const region = page.getByRole("region", { name: "Featured Testimonies" })
  await expect(region.getByRole("navigation")).toHaveCount(0)

  for (const [index, testimony] of testimonies.entries()) {
    const level = index === 0 ? 1 : 2
    await expect(region.getByRole("heading", { level, name: testimony.name })).toBeVisible()
    await expect(region.getByText(testimony.writeup)).toBeVisible()

    const surface = region.getByRole("link", { name: `Open ${testimony.title}` })
    await expect(surface).toHaveAttribute("href", testimony.url)
    await expect(surface).toHaveAttribute("target", "_blank")
    await expect(surface).toHaveAttribute("rel", "noopener noreferrer")
    await expect(surface.locator("img")).toHaveAttribute("src", testimony.thumbnailUrl)
    await expect(surface.locator(".watch-play")).toBeVisible()
  }

  await expect(region.locator(".watch-testimony-title")).toHaveCount(0)
  await expect(page.locator("iframe")).toHaveCount(0)
})
test("shows eight Acid sermon titles linked to their playlists and Atom thumbs", async ({
  page,
}) => {
  await page.goto("/watch")

  for (const theme of playlistThemes) {
    const row = page.getByRole("region", { name: theme.name })
    const title = row.getByRole("heading", { level: 3, name: theme.name })
    await expect(title).toBeVisible()
    await expect(title).toHaveCSS("color", ACID)
    const playlist = title.getByRole("link", { name: theme.name })
    await expect(playlist).toHaveAttribute(
      "href",
      `https://www.youtube.com/playlist?list=${theme.playlistId}`,
    )
    await expect(playlist).toHaveAttribute("target", "_blank")
    await expect(playlist).toHaveAttribute("rel", "noopener noreferrer")

    const thumbs = row.locator('a[href^="https://www.youtube.com/watch?v="]')
    await expect(thumbs).toHaveCount(FIXTURE_VIDEO_TITLES.length)
    for (const [index, video] of fixtureVideos.prefix.entries()) {
      const link = thumbs.nth(index)
      await expect(link).toHaveAttribute("aria-label", video.title)
      await expect(link).toHaveAttribute("target", "_blank")
      await expect(link.locator("img")).toHaveAttribute(
        "src",
        `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`,
      )
      await expect(link.locator("img")).toHaveAttribute("alt", "")
      await expect(link.locator("img")).toHaveAttribute("referrerpolicy", "no-referrer")
    }
  }

  await expect(
    freeSermonsRow(page).locator('a[href^="https://www.youtube.com/watch?v="]'),
  ).toHaveCount(FIXTURE_VIDEO_TITLES.length)
})

test("narrow viewport stacks and still shows testimonies and sermon rows", async ({
  page,
}) => {
  await page.setViewportSize(phone)
  await page.goto("/watch")

  await expect(page.getByText(YOUTUBE_LIVE_OFFLINE_COPY)).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Live", exact: true })).toHaveCount(0)
  await expect(page.locator(".watch-live")).toHaveCount(0)
  await expect(page.getByRole("region", { name: "Featured Testimonies" })).toBeVisible()
  await expect(page.getByRole("heading", { level: 1, name: "4th Stage Lung Cancer Healed" })).toBeVisible()
  for (const testimony of testimonies) {
    await expect(page.getByRole("heading", { name: testimony.name })).toBeVisible()
    await expect(page.getByRole("region", { name: "Featured Testimonies" }).getByText(testimony.writeup)).toBeVisible()
  }
  await expect(page.locator(".watch-testimony-title")).toHaveCount(0)
  for (const theme of playlistThemes) {
    await expect(page.getByRole("region", { name: theme.name })).toBeVisible()
    await expect(page.getByRole("heading", { level: 3, name: theme.name })).toBeVisible()
  }
})
