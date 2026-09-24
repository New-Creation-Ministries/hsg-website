import { expect, test } from "@playwright/test"

import {
  scenes,
  storyContinuesAddress,
  storyContinuesIntro,
  storyContinuesServices,
} from "../src/content/about"
import { churchName, shellSentence } from "./copy"
import { desktop, headerNav } from "./helpers"

const plateScenes = scenes.filter((scene) => scene.plate)
const storyContinues = scenes.find((scene) => scene.id === "story-continues")!

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/about")
})

test("opens About without the shell sentence and with the document title", async ({ page }) => {
  await expect(page).toHaveTitle(`About | ${churchName}`)
  await expect(page.getByText(shellSentence)).toHaveCount(0)
  await expect(page.getByRole("heading", { level: 1, name: "Founders" })).toBeVisible()
  await expect(headerNav(page).getByRole("link", { name: "About", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
})

test("renders the six scenes with locked headings, copy, and five plates", async ({ page }) => {
  for (const scene of scenes) {
    const section = page.locator(`#${scene.id}`)
    await expect(section).toBeVisible()
    const headingLevel = scene.id === "founders" ? 1 : 2
    await expect(
      section.getByRole("heading", { level: headingLevel, name: scene.heading }),
    ).toBeVisible()
    for (const paragraph of scene.paragraphs) {
      await expect(section.getByText(paragraph)).toBeVisible()
    }
  }

  expect(plateScenes).toHaveLength(5)
  for (const scene of plateScenes) {
    const plate = page.locator(`#${scene.id} [role="img"]`)
    await expect(plate).toHaveAttribute("aria-label", scene.plate!.alt)
    await expect(plate).toHaveCSS("background-image", new RegExp(scene.plate!.src.replace(/\./g, "\\.")))
  }

  await expect(page.locator("#story-continues [role='img']")).toHaveCount(0)
  await expect(page.getByText(storyContinuesIntro)).toBeVisible()
  await expect(page.getByText(storyContinuesAddress)).toBeVisible()
})

test("The story continues shows Home Sunday services and omits Kannada and English lines", async ({
  page,
}) => {
  const band = page.locator("#story-continues .plate.band")
  await expect(band).toBeVisible()

  for (const item of storyContinuesServices) {
    await expect(band.getByRole("heading", { level: 3, name: item.title })).toBeVisible()
    const [language, time] = (item.text ?? "").split("\n")
    if (language) await expect(band.getByText(language, { exact: true })).toBeVisible()
    if (time) await expect(band.getByText(time, { exact: true })).toBeVisible()
  }

  await expect(band.getByText("Kannada Service")).toHaveCount(0)
  await expect(band.getByText("English Service")).toHaveCount(0)
  expect(storyContinues.plate).toBeUndefined()
})

test("keeps the header visible until scroll, then snaps and hides it", async ({ page }) => {
  const aboutHeader = page.locator(".site-header")
  await expect(aboutHeader).toHaveCSS("position", "relative")
  await expect(aboutHeader).toBeVisible()
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "y mandatory")

  await page.mouse.wheel(0, 80)
  await expect(page.locator("html")).toHaveClass(/about-snapping/)
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "y mandatory")
  await page.evaluate(() => document.scrollingElement?.scrollTo(0, 0))
  await expect(aboutHeader).toBeVisible()

  await page.goto("/")
  await expect(page.locator(".site-header")).toHaveCSS("position", "sticky")

  await page.goto("/events")
  await expect(page.locator(".site-header")).toHaveCSS("position", "sticky")
})

test("snaps the footer after the last scene", async ({ page }) => {
  await page.mouse.wheel(0, 80)
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "y mandatory")
  await expect(page.locator(".site-footer")).toHaveCSS("scroll-snap-align", "start")

  for (const scene of scenes) {
    await expect(page.locator(`#${scene.id}`)).toHaveCSS("scroll-snap-align", "start")
  }

  await page.locator("#story-continues").scrollIntoViewIfNeeded()
  await page.evaluate(() => {
    document.scrollingElement?.scrollBy(0, window.innerHeight)
  })
  await expect(page.getByRole("contentinfo")).toBeInViewport()
})

test("phone scroll arms snap the same way", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/about")
  await expect(page.locator(".site-header")).toBeVisible()
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "y mandatory")

  await page.evaluate(() => {
    const scroller = document.scrollingElement
    scroller?.dispatchEvent(new WheelEvent("wheel", { deltaY: 40, bubbles: true }))
    scroller?.dispatchEvent(new Event("touchmove", { bubbles: true }))
  })
  await expect(page.locator("html")).toHaveClass(/about-snapping/)
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "y mandatory")
  await expect(page.locator("#founders")).toHaveCSS("scroll-snap-align", "start")
})
