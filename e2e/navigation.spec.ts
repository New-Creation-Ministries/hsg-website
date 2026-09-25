import { expect, test } from "@playwright/test"

import { churchName, navLabels, routes, shellSentence, sundayServices } from "./copy"
import { aboveMenu, atMenu, desktop, expectNoHorizontalScroll, headerNav, phone } from "./helpers"

const routeLabels = [...navLabels]

test("opens, escapes, and closes Menu at 800px", async ({ page }) => {
  await page.setViewportSize(atMenu)
  await page.goto("/")
  const menu = page.getByRole("button", { name: "Menu" })
  const nav = headerNav(page)

  await expect(menu).toHaveAttribute("aria-expanded", "false")
  await menu.focus()
  await page.keyboard.press("Tab")
  await expect(nav.locator(":focus")).toHaveCount(0)

  await menu.click()
  await expect(menu).toBeFocused()
  await expect(menu).toHaveAttribute("aria-expanded", "true")
  await expect(nav.getByRole("link")).toHaveText(routeLabels)

  await page.keyboard.press("Tab")
  await expect(nav.getByRole("link", { name: "About" })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(menu).toBeFocused()
  await expect(menu).toHaveAttribute("aria-expanded", "false")
  await expect(nav.getByRole("link", { name: "About" })).toBeHidden()

  await menu.click()
  await nav.getByRole("link", { name: "Contact Us" }).click()
  await expect(page).toHaveURL("/contact")
  await expect(
    page.getByRole("heading", { level: 1, name: "COME AND RECEIVE YOUR MIRACLE" }),
  ).toBeVisible()
  await expect(page.getByText(shellSentence)).toHaveCount(0)
  await expect(menu).toHaveAttribute("aria-expanded", "false")
})

test("keeps navigation focus visible across the 800px threshold", async ({ page }) => {
  await page.setViewportSize(atMenu)
  await page.goto("/")
  const menu = page.getByRole("button", { name: "Menu" })
  const nav = headerNav(page)

  await menu.focus()
  await page.setViewportSize(aboveMenu)
  await expect(nav.getByRole("link", { name: "About" })).toBeFocused()
  await expect(nav.getByRole("link", { name: "About" })).toBeVisible()

  await nav.getByRole("link", { name: "Events" }).focus()
  await page.setViewportSize(atMenu)
  await expect(menu).toHaveAttribute("aria-expanded", "true")
  await expect(nav.getByRole("link", { name: "Events" })).toBeFocused()
  await expect(nav.getByRole("link", { name: "Events" })).toBeVisible()
})

test("does not scroll the page sideways at 320px", async ({ page }) => {
  await page.setViewportSize(phone)
  await page.goto("/")
  await expectNoHorizontalScroll(page)
  await expect(page.getByRole("heading", { level: 1, name: churchName })).toBeVisible()
  await expect(page.getByText(sundayServices[0]!.time)).toBeVisible()
  await expect(page.getByText("A woman had lived for three decades with double scoliosis, a missing rib, and four back surgeries.")).toBeVisible()
})

test("skip link moves focus to main", async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/")
  await page.keyboard.press("Tab")
  const skip = page.getByRole("link", { name: "Skip to main content" })
  await expect(skip).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.locator("#main-content")).toBeFocused()
})

test("opens every shell with its title, heading, and current page", async ({ page }) => {
  await page.setViewportSize(desktop)
  for (const route of routes) {
    await page.goto(route.path)
    if (route.path === "/") {
      await expect(page).toHaveTitle(churchName)
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(churchName)
    } else if (route.path === "/events") {
      await expect(page).toHaveTitle(`Events | ${churchName}`)
      await expect(page.getByRole("heading", { level: 1, name: "Events" })).toBeVisible()
      await expect(page.getByText(shellSentence)).toHaveCount(0)
    } else if (route.path === "/about") {
      await expect(page).toHaveTitle(`About | ${churchName}`)
      await expect(page.getByRole("heading", { level: 1, name: "Founders" })).toBeVisible()
      await expect(page.getByText(shellSentence)).toHaveCount(0)
    } else if (route.path === "/give") {
      await expect(page).toHaveTitle(`Give | ${churchName}`)
      await expect(page.getByRole("heading", { level: 1, name: "Why we give" })).toBeVisible()
      await expect(page.getByText(shellSentence)).toHaveCount(0)
    } else if (route.path === "/watch") {
      await expect(page).toHaveTitle(`Watch | ${churchName}`)
      await expect(page.getByRole("heading", { level: 1, name: "4th Stage Lung Cancer Healed" })).toBeVisible()
      await expect(page.getByText(shellSentence)).toHaveCount(0)
    } else if (route.path === "/contact") {
      await expect(page).toHaveTitle(`Contact Us | ${churchName}`)
      await expect(
        page.getByRole("heading", { level: 1, name: "COME AND RECEIVE YOUR MIRACLE" }),
      ).toBeVisible()
      await expect(page.getByText(shellSentence)).toHaveCount(0)
    } else {
      await expect(page).toHaveTitle(`${route.label} | ${churchName}`)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.label)
      await expect(page.getByText(shellSentence)).toBeVisible()
    }
    if (route.path === "/") {
      await expect(page.locator("nav a[aria-current='page']")).toHaveCount(0)
      await expect(page.getByRole("link", { name: churchName })).toHaveAttribute("href", "/")
    } else {
      const current = headerNav(page).getByRole("link", { name: route.label, exact: true })
      await expect(current).toHaveAttribute("aria-current", "page")
      await expect(page.locator("nav a[aria-current='page']")).toHaveCount(1)
      await expect(page.locator("nav a[aria-current='page']")).toHaveText(route.label)
    }
  }
})

test("returns from a shell with browser Back", async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/")
  await page.evaluate(() => window.scrollTo(0, 400))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
  // Programmatic click avoids Playwright scrolling the sticky header into view
  // (which zeros scrollY before SiteHeader records it for Back restoration).
  await headerNav(page)
    .getByRole("link", { name: "Give" })
    .evaluate((link: HTMLAnchorElement) => link.click())
  await expect(page).toHaveURL("/give")
  await page.goBack()
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("heading", { level: 1, name: churchName })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
})
