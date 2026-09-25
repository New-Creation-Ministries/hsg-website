import { expect, test, type Page } from "@playwright/test"

import {
  scenes,
  storyContinuesAddress,
  storyContinuesIntro,
  storyContinuesServices,
} from "../src/content/about"
import { churchName, shellSentence } from "./copy"
import { desktop, headerNav, phone, phoneLarge } from "./helpers"

const plateScenes = scenes.filter((scene) => scene.plate)
const storyContinues = scenes.find((scene) => scene.id === "story-continues")!
const coverPlateIds = ["founders", "the-call", "nations"] as const
const containPlateIds = ["born-again", "church"] as const
const coverPhonePositions = {
  founders: "50% 18%",
  "the-call": "50% 58%",
  nations: "50% 42%",
} as const

const phoneViewports = [
  { name: "390×844", size: phoneLarge },
  { name: "phone helper 320×700", size: phone },
] as const

async function armAboutSnap(page: Page) {
  await page.evaluate(() => {
    const scroller = document.scrollingElement
    scroller?.dispatchEvent(new WheelEvent("wheel", { deltaY: 40, bubbles: true }))
    scroller?.dispatchEvent(new Event("touchmove", { bubbles: true }))
  })
  await expect(page.locator("html")).toHaveClass(/about-snapping/)
}

async function expectSceneFitsPhoneViewport(page: Page, sceneId: string) {
  const scene = scenes.find((entry) => entry.id === sceneId)!
  const section = page.locator(`#${sceneId}`)
  await section.scrollIntoViewIfNeeded()

  const metrics = await section.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return { height: rect.height, viewportHeight: window.innerHeight }
  })
  // +1 allows subpixel rounding; spec requires height ≤ viewport.
  expect(
    metrics.height,
    `${sceneId} height ${metrics.height} exceeds viewport ${metrics.viewportHeight}`,
  ).toBeLessThanOrEqual(metrics.viewportHeight + 1)

  const headingLevel = sceneId === "founders" ? 1 : 2
  await expect(
    section.getByRole("heading", { level: headingLevel, name: scene.heading }),
  ).toBeInViewport()
  for (const paragraph of scene.paragraphs) {
    await expect(section.getByText(paragraph)).toBeInViewport()
  }

  if (scene.plate) {
    await expect(section.locator('[role="img"]')).toBeInViewport()
    return
  }

  const band = section.locator(".plate.band")
  await expect(band).toBeInViewport()
  await expect(band.getByText(storyContinuesAddress)).toBeInViewport()
  for (const item of storyContinuesServices) {
    await expect(band.getByRole("heading", { level: 3, name: item.title })).toBeInViewport()
    const [language, time] = (item.text ?? "").split("\n")
    if (language) await expect(band.getByText(language, { exact: true })).toBeInViewport()
    if (time) await expect(band.getByText(time, { exact: true })).toBeInViewport()
  }
}

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
  await page.setViewportSize(phoneLarge)
  await page.goto("/about")
  await expect(page.locator(".site-header")).toBeVisible()
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "y mandatory")

  await armAboutSnap(page)
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "y mandatory")
  await expect(page.locator("#founders")).toHaveCSS("scroll-snap-align", "start")
})

for (const viewport of phoneViewports) {
  test(`fits each scene in one phone viewport at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport.size)
    await page.goto("/about")
    await armAboutSnap(page)

    for (const scene of scenes) {
      await expectSceneFitsPhoneViewport(page, scene.id)
    }
  })
}

for (const viewport of phoneViewports) {
  test(`cover plates keep cover mode and phone subject framing at ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport.size)
    await page.goto("/about")
    await armAboutSnap(page)

    for (const id of coverPlateIds) {
      const plate = page.locator(`#${id} [role="img"]`)
      await plate.scrollIntoViewIfNeeded()
      await expect(plate).toHaveCSS("background-size", "cover")
      await expect(plate).toHaveCSS("background-position", coverPhonePositions[id])
    }
  })
}

for (const viewport of phoneViewports) {
  test(`contain plates keep contain mode and fill color at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport.size)
    await page.goto("/about")
    await armAboutSnap(page)

    for (const id of containPlateIds) {
      const plate = page.locator(`#${id} [role="img"]`)
      await plate.scrollIntoViewIfNeeded()
      await expect(plate).toHaveCSS("background-size", "contain")
      await expect(plate).toHaveCSS("background-color", "rgb(42, 22, 15)")
    }
  })
}

test("attaches per-scene 390×844 phone screenshots for human review", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(phoneLarge)
  await page.goto("/about")
  await armAboutSnap(page)

  for (const scene of scenes) {
    const section = page.locator(`#${scene.id}`)
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeInViewport()
    if (scene.plate) {
      await expect(section.locator('[role="img"]')).toBeVisible()
    } else {
      await expect(section.locator(".plate.band")).toBeVisible()
    }
    const body = await page.screenshot({ type: "png" })
    await testInfo.attach(`about-phone-390-${scene.id}.png`, {
      body,
      contentType: "image/png",
    })
  }
})
