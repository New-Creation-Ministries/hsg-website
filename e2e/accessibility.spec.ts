import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import { routes, sections, sundayServices } from "./copy"
import { atMenu, desktop, expectMinHeight, headerNav, paintedBackground } from "./helpers"

function firstSermonVideo(page: Page) {
  return page
    .getByRole("region", { name: "Sermons" })
    .locator('a[href^="https://www.youtube.com/watch?v="]')
    .first()
}

async function expectNoSeriousViolations(page: Page, path?: string) {
  // Human review locked cobalt headings on ink for About. That pair stays.
  let builder = new AxeBuilder({ page })
  if (path === "/about") builder = builder.disableRules(["color-contrast"])
  const results = await builder.analyze()
  const blocking = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  )
  expect(blocking).toEqual([])
}

test("home and shells have no serious axe violations", async ({ page }) => {
  await page.setViewportSize(desktop)
  for (const route of routes) {
    await page.goto(route.path)
    await expectNoSeriousViolations(page, route.path)
  }
  await page.setViewportSize(atMenu)
  await page.goto("/")
  await expectNoSeriousViolations(page)
})

test("gives Menu, navigation, and section links a 44px target", async ({ page }) => {
  await page.setViewportSize(atMenu)
  await page.goto("/")
  await expectMinHeight(page.getByRole("button", { name: "Menu" }))

  await page.setViewportSize(desktop)
  for (const link of await headerNav(page).getByRole("link").all()) {
    await expectMinHeight(link)
  }
  const sectionLinks = [
    page.getByRole("main").getByRole("link", { name: "About", exact: true }),
    page.getByRole("region", { name: sections[0] }).getByRole("link", { name: "Events" }),
    page.getByRole("region", { name: "Sermons" }).getByRole("link", { name: "Watch" }),
    page.getByRole("region", { name: "New to HSG?" }).getByRole("link", { name: "Know More" }),
  ]
  for (const link of sectionLinks) await expectMinHeight(link)
  await expectMinHeight(firstSermonVideo(page))
})

test("uses the Spirit in Blue colors for text on ink, cobalt, and the testimony band", async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/")

  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(9, 13, 21)")
  await expect(page.locator("body")).toHaveCSS("color", "rgb(245, 243, 232)")
  await expect(page.locator("body")).toHaveCSS("font-size", "16px")
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("text-transform", "uppercase")
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-weight", "500")

  const headingFont = await page.getByRole("heading", { level: 1 }).evaluate((el) => getComputedStyle(el).fontFamily)
  const bodyFont = await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily)
  expect(headingFont).toMatch(/oswald/i)
  expect(bodyFont).toMatch(/dm[_\s]?sans/i)

  await expect(page.getByRole("region", { name: sections[0] }).getByRole("link", { name: "Events" })).toHaveCSS(
    "color",
    "rgb(222, 231, 127)",
  )
  await expect(firstSermonVideo(page)).toHaveCSS("color", "rgb(222, 231, 127)")
  expect(await paintedBackground(page.getByRole("heading", { level: 1 }))).toBe("rgb(23, 61, 224)")
  expect(await paintedBackground(page.getByRole("region", { name: "Sermons" }).locator(".channel"))).toBe(
    "rgb(23, 61, 224)",
  )

  const stories = page.getByRole("region", { name: "Highlighted testimonies" })
  expect(await paintedBackground(stories.getByRole("heading", { level: 2 }))).toBe("rgb(222, 223, 201)")
  await expect(stories.getByRole("heading", { level: 2 })).toHaveCSS("color", "rgb(20, 26, 32)")
  await expect(page.getByText(sundayServices[0]!.time)).toHaveCSS("color", "rgb(222, 231, 127)")

  await page.goto("/about")
  await expect(headerNav(page).getByRole("link", { name: "About" })).toHaveCSS("color", "rgb(222, 231, 127)")
})
