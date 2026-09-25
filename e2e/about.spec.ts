import { expect, test, type Page } from "@playwright/test"

import {
  scenes,
  storyContinuesAddress,
  storyContinuesIntro,
  storyContinuesServices,
} from "../src/content/about"
import { churchName, shellSentence } from "./copy"
import {
  aboveMenu,
  atMenu,
  box,
  desktop,
  headerNav,
  phone,
  phoneLarge,
  plateStyleMetrics,
  sceneBoxMetrics,
  waitForScrollStable,
} from "./helpers"

const plateScenes = scenes.filter((scene) => scene.plate)
const storyContinues = scenes.find((scene) => scene.id === "story-continues")!
const coverPlates = [
  { id: "founders", position: "50% 18%" },
  { id: "the-call", position: "50% 58%" },
  { id: "nations", position: "50% 42%" },
] as const
const containPlates = ["born-again", "church"] as const

function sceneNav(page: Page) {
  return page.getByRole("navigation", { name: "Scenes" })
}

function sceneSection(page: Page, sceneId: string) {
  return page.locator(`#${sceneId}`)
}

async function disableReducedMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: "no-preference" })
}

async function armAboutSnap(page: Page) {
  const size = page.viewportSize()!
  await page.mouse.move(size.width / 2, size.height / 2)
  await page.mouse.wheel(0, 40)
  await expect(page.locator("html")).toHaveClass(/about-snapping/)
  // Native wheel scrolls; return to the top so later journeys start from a known position.
  await page.locator("#main-content").focus()
  await page.keyboard.press("Home")
  await waitForScrollStable(page)
  await expect(page.locator("html")).toHaveClass(/about-snapping/)
}

async function nativeSnapStep(page: Page, sceneIndex: number) {
  const size = page.viewportSize()!
  await page.mouse.move(size.width / 2, size.height / 2)
  const sceneId = scenes[sceneIndex]!.id

  await expect(async () => {
    await waitForScrollStable(page)
    let top = (await sceneBoxMetrics(page, sceneId)).top
    if (Math.abs(top) <= 1) return

    if (top > 0 && top < size.height * 0.5) {
      // Founders sits just under the header snap; a modest wheel reaches it.
      // A full PageDown from the header skips that first scene.
      await page.mouse.wheel(0, Math.ceil(top))
    } else if (top > 0) {
      await page.locator("#main-content").focus()
      await page.keyboard.press("PageDown")
    } else {
      await page.locator("#main-content").focus()
      await page.keyboard.press("PageUp")
    }

    await waitForScrollStable(page)
    top = (await sceneBoxMetrics(page, sceneId)).top
    expect(Math.abs(top)).toBeLessThanOrEqual(1)
  }).toPass({ timeout: 20_000 })
}

async function nativeSnapStepTowardFooter(page: Page) {
  await page.locator("#main-content").focus()

  await expect(async () => {
    await waitForScrollStable(page)
    const atDocumentEnd = await page.evaluate(() => {
      const scroller = document.scrollingElement
      if (!scroller) return false
      return Math.abs(scroller.scrollTop + scroller.clientHeight - scroller.scrollHeight) <= 2
    })
    if (!atDocumentEnd) {
      await page.keyboard.press("PageDown")
      await waitForScrollStable(page)
    }
    expect(
      await page.evaluate(() => {
        const scroller = document.scrollingElement
        if (!scroller) return false
        return Math.abs(scroller.scrollTop + scroller.clientHeight - scroller.scrollHeight) <= 2
      }),
    ).toBe(true)
  }).toPass({ timeout: 20_000 })
}

async function expectSettledScene(page: Page, sceneIndex: number) {
  const prev = scenes[sceneIndex - 1]
  const next = scenes[sceneIndex + 1]
  await waitForScrollStable(page)

  const metrics = await sceneBoxMetrics(page, scenes[sceneIndex]!.id)
  expect(Math.abs(metrics.top)).toBeLessThanOrEqual(1)

  if (prev) {
    const prevMetrics = await sceneBoxMetrics(page, prev.id)
    expect(prevMetrics.bottom).toBeLessThanOrEqual(1)
  }
  if (next) {
    const nextMetrics = await sceneBoxMetrics(page, next.id)
    expect(nextMetrics.top).toBeGreaterThanOrEqual(metrics.viewportHeight - 1)
  }
}

async function expectPhoneSceneFits(page: Page, sceneId: string) {
  const section = sceneSection(page, sceneId)
  const metrics = await sceneBoxMetrics(page, sceneId)
  expect(metrics.height).toBeLessThanOrEqual(metrics.viewportHeight + 1)

  const scene = scenes.find((entry) => entry.id === sceneId)!
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
  for (const item of storyContinuesServices) {
    await expect(band.getByRole("heading", { level: 3, name: item.title })).toBeInViewport()
    const [language, time] = (item.text ?? "").split("\n")
    if (language) {
      await expect(band.getByText(language, { exact: true })).toBeInViewport()
    }
    if (time) {
      await expect(band.getByText(time, { exact: true })).toBeInViewport()
    }
  }
  await expect(band.getByText(storyContinuesAddress)).toBeInViewport()
}

async function expectFooterFullyVisible(page: Page) {
  await waitForScrollStable(page)
  const atDocumentEnd = await page.evaluate(() => {
    const scroller = document.scrollingElement
    if (!scroller) return false
    return Math.abs(scroller.scrollTop + scroller.clientHeight - scroller.scrollHeight) <= 2
  })
  expect(atDocumentEnd).toBe(true)

  const footer = page.getByRole("contentinfo")
  await expect(footer).toBeInViewport()
  const footerBox = await box(footer)
  const viewportHeight = page.viewportSize()!.height
  expect(footerBox.y).toBeGreaterThanOrEqual(-1)
  expect(footerBox.y + footerBox.height).toBeLessThanOrEqual(viewportHeight + 1)
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

test("scopes zero scroll padding to About and keeps sticky-header clearance elsewhere", async ({
  page,
}) => {
  await expect(page.locator("html")).toHaveCSS("scroll-padding-top", "0px")

  await page.goto("/")
  await expect(page.locator("html")).toHaveCSS("scroll-padding-top", "104px")
})

test("settles each desktop scene flush with the viewport via scene dots", async ({ page }) => {
  await disableReducedMotion(page)
  await armAboutSnap(page)
  const dots = sceneNav(page)

  for (let index = 0; index < scenes.length; index++) {
    const scene = scenes[index]!
    await dots.getByRole("link", { name: scene.heading }).click()
    await expectSettledScene(page, index)
    await expect(dots.getByRole("link", { name: scene.heading })).toHaveAttribute(
      "aria-current",
      "true",
    )
  }
})

test("settles each phone scene flush without scene dots at 390×844", async ({ page }) => {
  await disableReducedMotion(page)
  await page.setViewportSize(phoneLarge)
  await page.goto("/about")
  await expect(sceneNav(page)).toHaveCount(0)
  await armAboutSnap(page)

  for (let index = 0; index < scenes.length; index++) {
    await nativeSnapStep(page, index)
    await expectSettledScene(page, index)
    await test.info().attach(`settled-${scenes[index]!.id}-390x844`, {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    })
  }
})

test("settles each phone scene flush without scene dots at 320×700", async ({ page }) => {
  await disableReducedMotion(page)
  await page.setViewportSize(phone)
  await page.goto("/about")
  await expect(sceneNav(page)).toHaveCount(0)
  await armAboutSnap(page)

  for (let index = 0; index < scenes.length; index++) {
    await nativeSnapStep(page, index)
    await expectSettledScene(page, index)
  }
})

test("hides scene dots from hit testing and the accessibility tree at 800px", async ({ page }) => {
  await page.setViewportSize(atMenu)
  await page.goto("/about")

  await expect(sceneNav(page)).toHaveCount(0)
  await expect(page.locator(".about-scene-dots")).toBeHidden()
})

test("keeps scene dots visible with links and aria-current at 801px and desktop", async ({
  page,
}) => {
  for (const viewport of [aboveMenu, desktop]) {
    await page.setViewportSize(viewport)
    await page.goto("/about")
    const dots = sceneNav(page)
    await expect(dots).toBeVisible()

    for (const scene of scenes) {
      await expect(dots.getByRole("link", { name: scene.heading })).toBeVisible()
    }

    await armAboutSnap(page)
    await dots.getByRole("link", { name: "The call" }).click()
    await waitForScrollStable(page)
    await expect(dots.getByRole("link", { name: "The call" })).toHaveAttribute(
      "aria-current",
      "true",
    )
  }
})

test("fits every phone scene within one viewport at both phone sizes", async ({ page }) => {
  await disableReducedMotion(page)

  for (const viewport of [phoneLarge, phone]) {
    await page.setViewportSize(viewport)
    await page.goto("/about")
    await armAboutSnap(page)

    for (let index = 0; index < scenes.length; index++) {
      await nativeSnapStep(page, index)
      await expectSettledScene(page, index)
      await expectPhoneSceneFits(page, scenes[index]!.id)
    }
  }
})

test("keeps cover and contain plate treatments on both phone viewports", async ({ page }) => {
  for (const viewport of [phoneLarge, phone]) {
    await page.setViewportSize(viewport)
    await page.goto("/about")

    for (const plate of coverPlates) {
      const metrics = await plateStyleMetrics(page.locator(`#${plate.id} [role="img"]`))
      expect(metrics.backgroundSize).toBe("cover")
      expect(metrics.backgroundPosition).toBe(plate.position)
    }

    for (const id of containPlates) {
      const metrics = await plateStyleMetrics(page.locator(`#${id} [role="img"]`))
      expect(metrics.backgroundSize).toBe("contain")
      expect(metrics.backgroundColor).toBe("rgb(42, 22, 15)")
    }
  }
})

test("settles the footer fully after The story continues on desktop and phone", async ({
  page,
}) => {
  await disableReducedMotion(page)

  for (const viewport of [desktop, phoneLarge, phone]) {
    await page.setViewportSize(viewport)
    await page.goto("/about")
    await armAboutSnap(page)

    if (viewport.width > 800) {
      await sceneNav(page).getByRole("link", { name: "The story continues" }).click()
      await waitForScrollStable(page)
      await nativeSnapStepTowardFooter(page)
    } else {
      await nativeSnapStep(page, scenes.length - 1)
      await nativeSnapStepTowardFooter(page)
    }

    await expectFooterFullyVisible(page)
  }
})

test("disables About scroll snapping under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/about")
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "none")
})

