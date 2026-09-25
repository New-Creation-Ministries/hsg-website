import { expect, test, type Page } from "@playwright/test"

import { arrival, contactStrip, visit } from "../src/content/contact"
import { churchName, shellSentence } from "./copy"
import { box, desktop, headerNav, phone, paintedBackground } from "./helpers"

const creamBand = "rgb(222, 223, 201)"

const liveTranslation = arrival.facts.find((fact) => fact.kind === "link")
if (!liveTranslation || liveTranslation.kind !== "link") {
  throw new Error("expected a live-translation link fact in contact arrival content")
}

const whatsApp = contactStrip.socials.find((social) => social.kind === "label")
if (!whatsApp || whatsApp.kind !== "label") {
  throw new Error("expected a WhatsApp label-only social in contact strip content")
}

function visitRegion(page: Page) {
  return page.getByRole("region", { name: visit.eyebrow })
}

function arrivalRegion(page: Page) {
  return page.getByRole("region", { name: arrival.heading })
}

function contactComplement(page: Page) {
  return page.getByRole("complementary", { name: "Contact" })
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/contact")
})

test("opens Contact Us without the shell sentence and with the document title", async ({
  page,
}) => {
  await expect(page).toHaveTitle(`Contact Us | ${churchName}`)
  await expect(page.getByText(shellSentence)).toHaveCount(0)
  await expect(
    page.getByRole("heading", { level: 1, name: visit.headline }),
  ).toBeVisible()
  await expect(
    headerNav(page).getByRole("link", { name: "Contact Us", exact: true }),
  ).toHaveAttribute("aria-current", "page")
})

test("renders locked visit, arrival, and contact strip copy with hrefs", async ({ page }) => {
  const visitSection = visitRegion(page)
  await expect(visitSection.getByText(visit.eyebrow, { exact: true })).toBeVisible()
  await expect(
    visitSection.getByRole("heading", { level: 1, name: visit.headline }),
  ).toBeVisible()
  await expect(visitSection.getByText(visit.address)).toBeVisible()

  const directions = page.getByRole("link", { name: visit.directions.label })
  await expect(directions).toHaveAttribute("href", visit.directions.href)

  const arrivalSection = arrivalRegion(page)
  await expect(
    arrivalSection.getByRole("heading", { level: 2, name: arrival.heading }),
  ).toBeVisible()

  for (const fact of arrival.facts) {
    if (fact.kind === "text") {
      await expect(arrivalSection.getByText(fact.text, { exact: true })).toBeVisible()
    } else {
      const link = arrivalSection.getByRole("link", { name: fact.text })
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute("href", fact.href)
      await expect(link).toHaveText(fact.text)
    }
  }

  await expect(page.getByText("https://glossa.live")).toHaveCount(0)

  const strip = contactComplement(page)
  await expect(
    strip.getByRole("link", { name: contactStrip.phone.display }),
  ).toHaveAttribute("href", contactStrip.phone.href)
  await expect(
    strip.getByRole("link", { name: contactStrip.email.display }),
  ).toHaveAttribute("href", contactStrip.email.href)

  for (const social of contactStrip.socials) {
    if (social.kind === "link") {
      await expect(strip.getByRole("link", { name: social.label })).toHaveAttribute(
        "href",
        social.href,
      )
    } else {
      await expect(strip.getByText(social.label, { exact: true })).toBeVisible()
      await expect(strip.getByRole("link", { name: social.label })).toHaveCount(0)
    }
  }
})

test("external http(s) links open in a new tab with G7 rel", async ({ page }) => {
  const httpLinks = page
    .locator(".contact-page")
    .locator('a[href^="http://"], a[href^="https://"]')
  await expect(httpLinks).toHaveCount(4)

  for (const link of await httpLinks.all()) {
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute("rel", "noopener noreferrer")
  }

  await expect(
    page.getByRole("link", { name: contactStrip.phone.display }),
  ).not.toHaveAttribute("target", "_blank")
  await expect(
    page.getByRole("link", { name: contactStrip.email.display }),
  ).not.toHaveAttribute("target", "_blank")
})

test("omits SiteFooter and keeps the cream contact strip at the page bottom", async ({
  page,
}) => {
  await expect(page.locator("footer.site-footer")).toHaveCount(0)
  await expect(page.getByRole("contentinfo")).toHaveCount(0)

  const strip = contactComplement(page)
  await expect(strip).toBeVisible()
  expect(await paintedBackground(strip)).toBe(creamBand)

  const visitBox = await box(visitRegion(page))
  const arrivalBox = await box(arrivalRegion(page))
  const stripBox = await box(strip)
  expect(stripBox.y).toBeGreaterThanOrEqual(Math.max(visitBox.y, arrivalBox.y))

  const lastChild = page.locator(".contact-page > :last-child")
  await expect(lastChild).toHaveAttribute("aria-label", "Contact")
})

test("narrow stack shows Visit above Arrival with all blocks visible", async ({ page }) => {
  await page.setViewportSize(phone)
  await page.goto("/contact")

  const visitSection = visitRegion(page)
  const arrivalSection = arrivalRegion(page)
  const strip = contactComplement(page)

  await expect(visitSection).toBeVisible()
  await expect(arrivalSection).toBeVisible()
  await expect(strip).toBeVisible()
  await expect(
    visitSection.getByRole("heading", { level: 1, name: visit.headline }),
  ).toBeVisible()
  await expect(
    arrivalSection.getByRole("heading", { level: 2, name: arrival.heading }),
  ).toBeVisible()
  await expect(page.getByRole("link", { name: visit.directions.label })).toBeVisible()
  await expect(
    page.getByRole("link", { name: liveTranslation.text }),
  ).toBeVisible()
  await expect(strip.getByText(whatsApp.label, { exact: true })).toBeVisible()

  const visitBox = await box(visitSection)
  const arrivalBox = await box(arrivalSection)
  const stripBox = await box(strip)
  expect(visitBox.y).toBeLessThan(arrivalBox.y)
  expect(arrivalBox.y).toBeLessThan(stripBox.y)
})
