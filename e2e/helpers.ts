import { expect, type Locator, type Page } from "@playwright/test"

export const desktop = { width: 1280, height: 900 }
export const atMenu = { width: 800, height: 900 }
export const aboveMenu = { width: 801, height: 900 }
export const phone = { width: 320, height: 700 }
/** Evidence / fit size used by About phone regression (spec 390×844). */
export const phoneLarge = { width: 390, height: 844 }

export function headerNav(page: Page) {
  return page.getByRole("navigation", { name: "Main navigation" })
}

export async function box(locator: Locator) {
  await expect(locator).toBeVisible()
  const value = await locator.boundingBox()
  expect(value).not.toBeNull()
  return value!
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflows = await page.evaluate(() => {
    const root = document.documentElement
    return root.scrollWidth > root.clientWidth + 1
  })
  expect(overflows).toBe(false)
}

export async function expectMinHeight(locator: Locator) {
  expect((await box(locator)).height).toBeGreaterThanOrEqual(44)
}

export async function paintedBackground(locator: Locator) {
  return locator.evaluate((el) => {
    let node: HTMLElement | null = el as HTMLElement
    while (node) {
      const background = getComputedStyle(node).backgroundColor
      if (background !== "rgba(0, 0, 0, 0)" && background !== "transparent") return background
      node = node.parentElement
    }
    return ""
  })
}
