import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { routes, sections } from "./copy"
import { atMenu, desktop, expectMinHeight, headerNav, paintedBackground } from "./helpers"

async function expectNoSeriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  )
  expect(blocking).toEqual([])
}

test("home and shells have no serious axe violations", async ({ page }) => {
  await page.setViewportSize(desktop)
  for (const route of routes) {
    await page.goto(route.path)
    await expectNoSeriousViolations(page)
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
    page.getByRole("region", { name: "Highlighted testimonies" }).getByRole("link", { name: "Praise Reports" }),
    page.getByRole("region", { name: "Sermons" }).getByRole("link", { name: "Watch" }),
    page.getByRole("region", { name: "New to HSG" }).getByRole("link", { name: "Contact Us" }),
  ]
  for (const link of sectionLinks) await expectMinHeight(link)
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

  const current = headerNav(page).getByRole("link", { name: "Home" })
  await expect(current).toHaveCSS("color", "rgb(222, 231, 127)")
  await expect(page.getByRole("region", { name: sections[0] }).getByRole("link", { name: "Events" })).toHaveCSS(
    "color",
    "rgb(222, 231, 127)",
  )
  await expect(paintedBackground(page.getByRole("heading", { level: 1 }))).toBe("rgb(23, 61, 224)")
  await expect(paintedBackground(page.getByRole("link", { name: "Evangelist Rambabu" }))).toBe("rgb(23, 61, 224)")

  const stories = page.getByRole("region", { name: "Highlighted testimonies" })
  await expect(paintedBackground(stories.getByRole("heading", { level: 2 }))).toBe("rgb(222, 223, 201)")
  await expect(stories.getByRole("heading", { level: 2 })).toHaveCSS("color", "rgb(20, 26, 32)")
  await expect(stories.getByRole("link", { name: "Praise Reports" })).toHaveCSS("color", "rgb(24, 45, 163)")
  await expect(page.getByText("8\u20139am")).toHaveCSS("color", "rgb(222, 231, 127)")
})
