import { expect, test } from "@playwright/test"

import { churchName, shellSentence } from "./copy"
import { desktop, expectNoHorizontalScroll, headerNav, phone } from "./helpers"

const whatsGoingOn = "What\u2019s going on"
const wordFest = "Word Fest Service"
const miracles = "Miracles and Healing Service"

test("opens Events from Home and the header, then Back returns Home", async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/")

  await page.getByRole("region", { name: whatsGoingOn }).getByRole("link", { name: "Events" }).click()
  await expect(page).toHaveURL("/events")
  await expect(page.getByRole("heading", { level: 1, name: "Events" })).toBeVisible()
  await expect(headerNav(page).getByRole("link", { name: "Events", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )

  await page.goBack()
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("heading", { level: 1, name: churchName })).toBeVisible()

  await headerNav(page).getByRole("link", { name: "Events", exact: true }).click()
  await expect(page).toHaveURL("/events")
  await expect(headerNav(page).getByRole("link", { name: "Events", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )

  await page.goBack()
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("heading", { level: 1, name: churchName })).toBeVisible()
})

test("shows Voice of Apostles 2026, Sunday Home times, and no placeholder chrome", async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/events")

  await expect(page.getByText(shellSentence)).toHaveCount(0)
  await expect(page.getByText("Placeholder photograph")).toHaveCount(0)
  await expect(page.getByText("No upcoming events.")).toHaveCount(0)
  await expect(page.getByText("Times are in IST")).toHaveCount(0)
  await expect(page.getByText("Not on the dated line")).toHaveCount(0)
  await expect(
    page.getByRole("heading", { level: 2, name: "Voice of Apostles 2026" }),
  ).toBeVisible()
  await expect(page.getByText("Multilingual · AI Powered")).toBeVisible()
  await expect(page.getByText("1:30")).toHaveCount(0)

  await expect(page.getByRole("heading", { level: 2, name: "Sunday services" })).toBeVisible()
  await expect(page.getByRole("heading", { level: 3, name: wordFest })).toBeVisible()
  await expect(page.getByRole("heading", { level: 3, name: miracles })).toBeVisible()
  await expect(page.getByText("8\u20139am")).toBeVisible()
  await expect(page.getByText("9:30am onwards")).toBeVisible()

  await expect(page.getByLabel(`Add to calendar, ${wordFest}, every Sunday`)).toHaveCount(1)
  await expect(page.getByLabel(`Add to calendar, ${miracles}, every Sunday`)).toHaveCount(1)
})

test("Add to calendar offers Google and Apple subscribe links with target blank", async ({
  page,
}) => {
  await page.setViewportSize(desktop)
  await page.goto("/events")

  await page.getByLabel(`Add to calendar, ${wordFest}, every Sunday`).click()
  const wordGoogle = page.getByRole("link", { name: `Google Calendar, ${wordFest}` })
  const wordApple = page.getByRole("link", { name: `Apple Calendar, ${wordFest}` })
  await expect(wordGoogle).toBeVisible()
  await expect(wordApple).toBeVisible()
  await expect(wordGoogle).toHaveAttribute("href", /cid=webcal:\/\//)
  await expect(wordGoogle).toHaveAttribute("href", /\/events\/feeds\/word-fest\.ics/)
  await expect(wordGoogle).toHaveAttribute("target", "_blank")
  await expect(wordApple).toHaveAttribute("target", "_blank")

  await page.getByLabel(`Add to calendar, ${miracles}, every Sunday`).click()
  const miraclesApple = page.getByRole("link", { name: `Apple Calendar, ${miracles}` })
  const miraclesGoogle = page.getByRole("link", { name: `Google Calendar, ${miracles}` })
  await expect(miraclesApple).toBeVisible()
  await expect(miraclesGoogle).toBeVisible()
  const appleHref = await miraclesApple.getAttribute("href")
  expect(appleHref).toMatch(/^webcal:\/\//)
  expect(appleHref).toMatch(/\/events\/feeds\/miracles-and-healing\.ics$/)
  await expect(miraclesApple).toHaveAttribute("target", "_blank")
  await expect(miraclesGoogle).toHaveAttribute("target", "_blank")
})

test("keyboard opens Add to calendar and Tabs to Google Calendar", async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/events")

  const summary = page.getByLabel(`Add to calendar, ${wordFest}, every Sunday`)
  await page.getByRole("heading", { level: 1, name: "Events" }).focus()

  let reached = false
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab")
    if (await summary.evaluate((el) => el === document.activeElement)) {
      reached = true
      break
    }
  }
  expect(reached).toBe(true)

  await page.keyboard.press("Enter")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("link", { name: `Google Calendar, ${wordFest}` })).toBeFocused()
})

test("stays within the viewport at 320px with Sunday names visible", async ({ page }) => {
  await page.setViewportSize(phone)
  await page.goto("/events")
  await expectNoHorizontalScroll(page)
  await expect(page.getByRole("heading", { level: 3, name: wordFest })).toBeVisible()
  await expect(page.getByRole("heading", { level: 3, name: miracles })).toBeVisible()
})

test("serves the Word Fest feed as text/calendar with weekly Sunday RRULE", async ({
  request,
}) => {
  const response = await request.get("/events/feeds/word-fest.ics")
  expect(response.ok()).toBe(true)
  expect(response.headers()["content-type"]).toMatch(/text\/calendar/)
  const body = await response.text()
  expect(body).toContain("RRULE")
  expect(body).toContain("BYDAY=SU")
})
