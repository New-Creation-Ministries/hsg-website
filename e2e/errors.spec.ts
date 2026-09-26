import { expect, test, type Page } from "@playwright/test"

import { desktop, expectNoHorizontalScroll, headerNav, phone } from "./helpers"

async function expectMainNavigation(page: Page) {
  const menu = page.getByRole("button", { name: "Menu" })
  if (await menu.isVisible()) {
    await expect(menu).toBeVisible()
    return
  }
  await expect(headerNav(page)).toBeVisible()
}

async function expectNotFoundShell(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" })
  expect(response, `${path} navigation response`).not.toBeNull()
  expect(response!.status(), `${path} HTTP status`).toBe(404)

  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible()
  await expectMainNavigation(page)
  await expect(page.getByRole("contentinfo")).toBeVisible()
  const home = page.getByRole("link", { name: "Return to Home" })
  await expect(home).toBeVisible()
  await expect(home).toHaveAttribute("href", "/")
}

test("unknown route and unknown calendar feed return the not-found shell", async ({
  page,
}) => {
  await page.setViewportSize(desktop)
  await expectNotFoundShell(page, "/no-such-page")
  await expectNotFoundShell(page, "/events/feeds/unknown.ics")
})

test("home still responds 200 after visiting not-found", async ({ page }) => {
  await page.setViewportSize(desktop)
  await expectNotFoundShell(page, "/no-such-page")

  const response = await page.goto("/", { waitUntil: "domcontentloaded" })
  expect(response, "Home navigation response").not.toBeNull()
  expect(response!.status(), "Home HTTP status").toBe(200)
})

test("not-found page does not scroll sideways at 320px", async ({ page }) => {
  await page.setViewportSize(phone)
  await expectNotFoundShell(page, "/no-such-page")
  await expectNoHorizontalScroll(page)
})
