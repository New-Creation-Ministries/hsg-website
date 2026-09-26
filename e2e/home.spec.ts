import { expect, test } from "@playwright/test"

import { eventHighlights, sections as homeContent } from "../src/content/home"
import {
  absentReferenceCopy,
  blurb,
  scripture,
  scriptureRef,
  churchName,
  footerAddress,
  ministryName,
  navLabels,
  sections,
  sundayNote,
  sundayServices,
} from "./copy"
import { aboveMenu, atMenu, box, desktop, headerNav, paintedBackground } from "./helpers"

const goingOnScripture = homeContent.find(
  (section) => section.heading === "What’s going on",
)?.items[0]

function curlyQuoted(text: string) {
  return `\u201C${text}\u201D`
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktop)
})

test("shows the church, the blurb, and the three sections", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveTitle(churchName)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", blurb)
  const heading = page.getByRole("heading", { level: 1, name: churchName })
  await expect(heading).toBeVisible()
  await expect(page.getByRole("heading", { level: 1, name: "Apostle Dr. P. S. Rambabu" })).toHaveCount(0)
  await expect(page.getByText(blurb)).toBeVisible()
  for (const name of sections) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible()
  }
  await expect(page.getByRole("heading", { level: 2, name: "Highlighted testimonies" })).toHaveCount(0)
  await expect(page.getByText("Stories adapted from Rambo World Outreach.")).toHaveCount(0)
  await expect(page.getByText(sundayNote)).toBeVisible()
  await expect(page.getByText(ministryName)).toBeVisible()
  await expect(page.getByText(footerAddress)).toBeVisible()
  await expect(page.getByText("Word-based. Spirit-filled. Bengaluru.")).toHaveCount(0)
  for (const text of absentReferenceCopy) {
    await expect(page.getByText(text)).toHaveCount(0)
  }
  await expect(page.locator("iframe")).toHaveCount(0)
})

test("shows scripture and event highlights without slots or Highlighted testimonies", async ({ page }) => {
  await page.goto("/")
  expect(sundayServices.length).toBeGreaterThan(0)

  const highlights = page.getByRole("region", { name: sections[0] })
  await expect(highlights.getByText("Highlight to be published")).toHaveCount(0)
  expect(goingOnScripture).toBeTruthy()
  const goingOnQuote = curlyQuoted(goingOnScripture!.text!)
  await expect(highlights.getByRole("heading", { level: 3, name: goingOnScripture!.title })).toBeVisible()
  await expect(highlights.getByText(goingOnQuote)).toBeVisible()
  await expect(highlights.getByRole("link", { name: goingOnScripture!.title })).toHaveCount(0)
  await expect(highlights.locator("ul.highlights > li")).toHaveCount(1)
  const scriptureRow = highlights.locator("ul.highlights > li").first()
  await expect(scriptureRow.getByRole("heading", { level: 3 })).toHaveText(goingOnScripture!.title)
  await expect(scriptureRow.getByRole("paragraph")).toHaveText(goingOnQuote)

  const highlightRows = highlights.locator(".home-event-highlight-row")
  await expect(highlightRows).toHaveCount(eventHighlights.length)
  for (const highlight of eventHighlights) {
    const surface = highlights.getByRole("link", { name: `Open ${highlight.title}` })
    await expect(surface).toHaveAttribute("href", highlight.url)
    await expect(surface).toHaveAttribute("target", "_blank")
    await expect(surface).toHaveAttribute("rel", "noopener noreferrer")
    await expect(surface.locator("img")).toHaveAttribute("src", highlight.thumbnailUrl)
    await expect(surface.locator(".home-event-play")).toBeVisible()
    await expect(highlights.getByRole("heading", { level: 3, name: highlight.title })).toBeVisible()
  }
  await expect(highlights.getByRole("link", { name: "Events" })).toHaveAccessibleName("Events")

  await expect(page.getByRole("region", { name: "Highlighted testimonies" })).toHaveCount(0)
  await expect(page.getByText("Stories adapted from Rambo World Outreach.")).toHaveCount(0)
  await expect(page.getByRole("heading", { level: 3, name: "Healing story from Sherman, Illinois" })).toHaveCount(0)

  const sermons = page.getByRole("region", { name: "Sermons" })
  const sermonQuote = sermons.locator("blockquote.scripture")
  await expect(sermonQuote.getByRole("paragraph")).toHaveText(scripture)
  await expect(sermonQuote.locator("footer")).toHaveText(scriptureRef)
  await expect(sermons.getByRole("link", { name: "Evangelist Rambabu" })).toHaveCount(0)
  await expect(sermons.getByText("Playlist to be published")).toHaveCount(0)
  await expect(sermons.locator('a[href*="playlist?list="]')).toHaveCount(0)

  const videoLinks = sermons.locator('a[href^="https://www.youtube.com/watch?v="]')
  await expect(videoLinks).toHaveCount(5)
  await expect(sermons.getByRole("link", { name: "Fixture sermon one" })).toHaveAttribute(
    "href",
    "https://www.youtube.com/watch?v=fix001",
  )
  for (const link of await videoLinks.all()) {
    const href = await link.getAttribute("href")
    expect(href).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/)
    const id = new URL(href!).searchParams.get("v")
    expect(id).toBeTruthy()
    const img = link.locator("img")
    await expect(img).toHaveAttribute("src", `https://i.ytimg.com/vi/${id}/mqdefault.jpg`)
    await expect(img).toHaveAttribute("alt", "")
    const title = (await link.innerText()).trim()
    expect(title.length).toBeGreaterThan(0)
    await expect(link).toHaveAccessibleName(title)
    await expect(link).toHaveAttribute("target", "_blank")
  }

  await expect(sermons.getByRole("link", { name: "Watch" })).toHaveAttribute("href", "/watch")
  await expect(sermons.getByRole("link", { name: "Watch" })).toHaveAccessibleName("Watch")
  await expect(page.locator("iframe")).toHaveCount(0)

  const portrait = page.locator("[aria-hidden='true']").getByText("HSG", { exact: true })
  await expect(portrait).toBeVisible()
  await expect(page.getByRole("img", { name: "Apostle Dr. P. S. Rambabu" })).toHaveCount(0)
  await expect(page.getByRole("link", { name: "HSG", exact: true })).toHaveCount(0)
})

test("keeps sermon titles when YouTube thumbnails are blocked", async ({ page }) => {
  await page.route("https://i.ytimg.com/**", (route) => route.abort())
  await page.goto("/")

  const sermons = page.getByRole("region", { name: "Sermons" })
  const videoLinks = sermons.locator('a[href^="https://www.youtube.com/watch?v="]')
  await expect(videoLinks).toHaveCount(5)
  for (const link of await videoLinks.all()) {
    const title = (await link.innerText()).trim()
    expect(title.length).toBeGreaterThan(0)
    await expect(link).toBeVisible()
    await expect(link.getByText(title)).toBeVisible()
  }
})

test("reads both Sunday services with Know More and no visit claim", async ({ page }) => {
  await page.goto("/")
  expect(sundayServices.length).toBe(2)
  const [wordFest, miracles] = sundayServices
  const sunday = page.getByRole("region", { name: "New to HSG?" })
  const text = await sunday.innerText()
  const word = text.indexOf(wordFest.title)
  const english = text.indexOf(wordFest.language)
  const morning = text.indexOf(wordFest.time)
  const healing = text.indexOf(miracles.title)
  const multilingual = text.indexOf(miracles.language)
  const onwards = text.indexOf(miracles.time)
  const note = text.indexOf(sundayNote)
  expect(word).toBeGreaterThan(-1)
  expect(word).toBeLessThan(english)
  expect(english).toBeLessThan(morning)
  expect(morning).toBeLessThan(healing)
  expect(healing).toBeLessThan(multilingual)
  expect(multilingual).toBeLessThan(onwards)
  expect(onwards).toBeLessThan(note)
  await expect(sunday.getByText("Join us every Sunday to worship the Lord together and celebrate his goodness in our lives")).toBeVisible()
  await expect(sunday.getByRole("link", { name: "Know More" })).toBeVisible()
  await expect(sunday.getByText(/direction|booking|reserve/i)).toHaveCount(0)
})

test("opens a sermon video in a new tab", async ({ page }) => {
  await page.context().route("https://www.youtube.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>YouTube</title><p>YouTube</p>",
    }),
  )
  await page.goto("/")
  const sermons = page.getByRole("region", { name: "Sermons" })
  const video = sermons.locator('a[href^="https://www.youtube.com/watch?v="]').first()
  const videoHref = await video.getAttribute("href")
  expect(videoHref).toBeTruthy()
  const videoPopup = page.waitForEvent("popup")
  await video.click()
  const videoPage = await videoPopup
  await expect(videoPage).toHaveURL(videoHref!)
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole("heading", { level: 1, name: churchName })).toBeVisible()
  await videoPage.close()
  await expect(sermons.locator('a[href*="playlist?list="]')).toHaveCount(0)
  await expect(page.locator("iframe")).toHaveCount(0)
})

test("places the portrait beside the introduction on a wide screen and below About when narrow", async ({ page }) => {
  await page.goto("/")
  const heading = page.getByRole("heading", { level: 1 })
  const introduction = page.getByText(blurb)
  const about = page.getByRole("main").getByRole("link", { name: "About", exact: true })
  const portrait = page.locator("[aria-hidden='true']").getByText("HSG", { exact: true })

  expect((await box(portrait)).x).toBeGreaterThan((await box(heading)).x)

  await page.setViewportSize(atMenu)
  expect((await box(heading)).y).toBeLessThan((await box(introduction)).y)
  expect((await box(introduction)).y).toBeLessThan((await box(about)).y)
  expect((await box(about)).y).toBeLessThan((await box(portrait)).y)
})

test("puts event highlights beside each other and the Events link beside the heading", async ({ page }) => {
  await page.goto("/")
  const highlights = page.getByRole("region", { name: sections[0] })
  expect(goingOnScripture).toBeTruthy()
  const scriptureTitle = highlights.getByRole("heading", { level: 3, name: goingOnScripture!.title })
  const firstHighlight = highlights.getByRole("heading", { level: 3, name: eventHighlights[0]!.title })
  const secondHighlight = highlights.getByRole("heading", { level: 3, name: eventHighlights[1]!.title })
  const firstBox = await box(firstHighlight)
  const secondBox = await box(secondHighlight)
  expect((await box(scriptureTitle)).y).toBeLessThan(firstBox.y)
  expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(8)
  expect(firstBox.x).toBeLessThan(secondBox.x)

  const heading = highlights.getByRole("heading", { level: 2 })
  const eventsLink = highlights.getByRole("link", { name: "Events" })
  const headingBox = await box(heading)
  const eventsBox = await box(eventsLink)
  expect(eventsBox.x).toBeGreaterThan(headingBox.x)
  expect(Math.abs(eventsBox.y - headingBox.y)).toBeLessThan(48)
})

test("uses the wide event-highlight, sermon, and Sunday compositions", async ({ page }) => {
  await page.goto("/")
  const goingOn = page.getByRole("region", { name: sections[0] })
  const highlightRows = goingOn.locator(".home-event-highlight-row")

  await page.setViewportSize(aboveMenu)
  const widths = await highlightRows.evaluateAll((nodes) =>
    nodes.map((row) => row.getBoundingClientRect().width),
  )
  expect(widths).toHaveLength(2)
  expect(Math.abs(widths[0]! - widths[1]!)).toBeLessThan(8)
  const [firstRow, secondRow] = await Promise.all([box(highlightRows.nth(0)), box(highlightRows.nth(1))])
  expect(Math.abs(firstRow.y - secondRow.y)).toBeLessThan(8)
  expect(firstRow.x).toBeLessThan(secondRow.x)

  const sermons = page.getByRole("region", { name: "Sermons" })
  const quote = sermons.locator(".channel")
  const videos = sermons.locator('a[href^="https://www.youtube.com/watch?v="]')
  const quoteBox = await box(quote)
  const firstVideo = await box(videos.nth(0))
  const secondVideo = await box(videos.nth(1))
  const thirdVideo = await box(videos.nth(2))
  expect(quoteBox.x).toBeLessThan(firstVideo.x)
  expect(Math.abs(quoteBox.y - firstVideo.y)).toBeLessThan(8)
  expect(Math.abs(secondVideo.x - quoteBox.x)).toBeLessThan(8)
  expect(secondVideo.y).toBeGreaterThan(quoteBox.y + quoteBox.height - 8)
  expect(Math.abs(thirdVideo.y - secondVideo.y)).toBeLessThan(8)
  expect(thirdVideo.x).toBeGreaterThan(secondVideo.x)
  expect((await box(page.getByRole("heading", { level: 2, name: "New to HSG?" }))).y).toBeLessThan(
    (await box(sermons.getByRole("heading", { level: 2 }))).y,
  )

  const sunday = page.getByRole("region", { name: "New to HSG?" })
  const knowMore = sunday.getByRole("link", { name: "Know More" })
  const time = sunday.getByText(sundayServices[0]!.time)
  expect((await box(knowMore)).x).toBeLessThan((await box(time)).x)

  await page.setViewportSize(atMenu)
  expect((await box(highlightRows.nth(0))).y).toBeLessThan((await box(highlightRows.nth(1))).y)
  const rules = await highlightRows.evaluateAll((rows) =>
    rows.map((row) => getComputedStyle(row).borderTopWidth),
  )
  expect(rules).toHaveLength(2)
  expect(rules[0]).toBe("0px")
  expect(rules[1]).toBe("1px")
  expect((await box(quote)).y).toBeLessThan((await box(videos.first())).y)
  expect((await box(knowMore)).y).toBeLessThan((await box(time)).y)
})

test("names the brand from the logo and keeps routes in the header only", async ({ page }) => {
  await page.goto("/")
  const brand = page.getByRole("link", { name: churchName })
  await expect(brand).toHaveCount(1)
  await expect(brand).toHaveAttribute("href", "/")
  expect((await brand.innerText()).trim()).toBe("")
  await expect(headerNav(page).getByRole("link")).toHaveText([...navLabels])
  const footerLinks = page.getByRole("contentinfo").getByRole("link")
  await expect(footerLinks).toHaveCount(3)
  await expect(footerLinks.nth(0)).toHaveAccessibleName("Facebook")
  await expect(footerLinks.nth(1)).toHaveAccessibleName("Instagram")
  await expect(footerLinks.nth(2)).toHaveAccessibleName("YouTube")
  await expect(page.getByRole("main").getByRole("link", { name: "About", exact: true })).toHaveAttribute("href", "/about")
  expect(await paintedBackground(page.getByRole("heading", { level: 1 }))).toBe("rgb(23, 61, 224)")
})

test("shows inline navigation above 800px and Menu at 800px", async ({ page }) => {
  await page.goto("/")
  await page.setViewportSize(aboveMenu)
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden()
  await expect(headerNav(page).getByRole("link", { name: "Give" })).toBeVisible()

  await page.setViewportSize(atMenu)
  await expect(page.getByRole("button", { name: "Menu" })).toBeVisible()
  await expect(headerNav(page).getByRole("link", { name: "Give" })).toBeHidden()
})
