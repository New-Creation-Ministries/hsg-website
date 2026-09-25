import { expect, test } from "@playwright/test"

import { giveCta, helpBar, scripture, whyWeGive } from "../src/content/give"
import { churchName, shellSentence } from "./copy"
import { box, desktop, headerNav, phone } from "./helpers"

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/give")
})

test("opens Give without the shell sentence and with the document title", async ({ page }) => {
  await expect(page).toHaveTitle(`Give | ${churchName}`)
  await expect(page.getByText(shellSentence)).toHaveCount(0)
  await expect(page.getByRole("heading", { level: 1, name: whyWeGive.heading })).toBeVisible()
  await expect(headerNav(page).getByRole("link", { name: "Give", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
})

test("renders locked scripture, why we give, GIVE CTA, and help contacts", async ({ page }) => {
  const scriptureRegion = page.getByRole("region", { name: "Scripture" })
  await expect(scriptureRegion.getByText(scripture.text)).toBeVisible()
  await expect(scriptureRegion.getByText(scripture.citation)).toBeVisible()

  await expect(page.getByRole("heading", { level: 1, name: whyWeGive.heading })).toBeVisible()
  await expect(page.getByText(whyWeGive.body)).toBeVisible()

  const cta = page.getByRole("link", { name: giveCta.label, exact: true })
  await expect(cta).toHaveAttribute("href", giveCta.href)
  await expect(cta).toHaveAttribute("target", "_blank")
  await expect(cta).toHaveAttribute("rel", "noopener noreferrer")

  const help = page.getByRole("complementary", { name: helpBar.label })
  await expect(help.getByText(helpBar.label)).toBeVisible()
  const phoneLink = help.getByRole("link", { name: helpBar.phone.display })
  const emailLink = help.getByRole("link", { name: helpBar.email.display })
  await expect(phoneLink).toHaveAttribute("href", helpBar.phone.href)
  await expect(emailLink).toHaveAttribute("href", helpBar.email.href)
  await expect(phoneLink).not.toHaveAttribute("target", "_blank")
  await expect(emailLink).not.toHaveAttribute("target", "_blank")
})

test("places the help bar above SiteFooter", async ({ page }) => {
  const help = page.getByRole("complementary", { name: helpBar.label })
  const footer = page.locator("footer.site-footer")
  await expect(help).toBeVisible()
  await expect(footer).toBeVisible()

  const helpBox = await box(help)
  const footerBox = await box(footer)
  expect(helpBox.y + helpBox.height).toBeLessThanOrEqual(footerBox.y + 1)

  const order = await help.evaluate((helpEl) => {
    const footerEl = document.querySelector("footer.site-footer")
    if (!footerEl) return null
    return Boolean(helpEl.compareDocumentPosition(footerEl) & Node.DOCUMENT_POSITION_FOLLOWING)
  })
  expect(order).toBe(true)
})

test("narrow viewport stacks and still shows every give block", async ({ page }) => {
  await page.setViewportSize(phone)
  await page.goto("/give")

  const scriptureRegion = page.getByRole("region", { name: "Scripture" })
  const whyHeading = page.getByRole("heading", { level: 1, name: whyWeGive.heading })
  const help = page.getByRole("complementary", { name: helpBar.label })
  const footer = page.locator("footer.site-footer")

  await expect(scriptureRegion).toBeVisible()
  await expect(page.getByText(scripture.text)).toBeVisible()
  await expect(page.getByText(scripture.citation)).toBeVisible()
  await expect(whyHeading).toBeVisible()
  await expect(page.getByText(whyWeGive.body)).toBeVisible()
  await expect(page.getByRole("link", { name: giveCta.label, exact: true })).toBeVisible()
  await expect(help).toBeVisible()
  await expect(page.getByRole("link", { name: helpBar.phone.display })).toBeVisible()
  await expect(page.getByRole("link", { name: helpBar.email.display })).toBeVisible()
  await expect(footer).toBeVisible()

  expect((await box(scriptureRegion)).y).toBeLessThan((await box(whyHeading)).y)
  expect((await box(help)).y).toBeLessThan((await box(footer)).y)
})
