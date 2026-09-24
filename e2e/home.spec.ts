import { expect, test, type Locator } from "@playwright/test"

import { events } from "../src/content/events"
import { sections as homeContent } from "../src/content/home"
import { homeEventSlots, type HomeEventSlot } from "../src/lib/home-event-slots"
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
  testimonySource,
} from "./copy"
import { aboveMenu, atMenu, box, desktop, headerNav, paintedBackground } from "./helpers"

const sundayItems =
  homeContent.find((section) => section.heading === "New to HSG?")?.items ?? []
const goingOnScripture = homeContent.find(
  (section) => section.heading === "What’s going on",
)?.items[0]
const testimonyScripture = homeContent.find(
  (section) => section.heading === "Highlighted testimonies",
)?.items[0]

function curlyQuoted(text: string) {
  return `\u201C${text}\u201D`
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktop)
})

async function expectEventSlot(region: Locator, slot: HomeEventSlot, index: number) {
  const row = region.locator("li").nth(index)
  await expect(row.getByRole("heading", { level: 3 })).toHaveText(slot.name)
  if (slot.kind === "dated") {
    await expect(row.getByText(slot.whenLine)).toBeVisible()
  } else {
    await expect(row.getByText(slot.language)).toBeVisible()
    await expect(row.getByText(slot.time)).toBeVisible()
  }
}

test("shows the church, the blurb, and the four sections", async ({ page }) => {
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
  await expect(page.getByText(testimonySource)).toBeVisible()
  await expect(page.getByText(sundayNote)).toBeVisible()
  await expect(page.getByText(ministryName)).toBeVisible()
  await expect(page.getByText(footerAddress)).toBeVisible()
  await expect(page.getByText("Word-based. Spirit-filled. Bengaluru.")).toHaveCount(0)
  for (const text of absentReferenceCopy) {
    await expect(page.getByText(text)).toHaveCount(0)
  }
  await expect(page.locator("iframe")).toHaveCount(0)
})

test("shows scripture, request-time event slots, and testimony scripture", async ({ page }) => {
  await page.goto("/")
  expect(sundayItems.length).toBeGreaterThan(0)
  const slots = homeEventSlots(events, sundayItems, new Date())

  const highlights = page.getByRole("region", { name: sections[0] })
  await expect(highlights.getByText("Highlight to be published")).toHaveCount(0)
  expect(goingOnScripture).toBeTruthy()
  const goingOnQuote = curlyQuoted(goingOnScripture!.text!)
  await expect(highlights.getByRole("heading", { level: 3, name: goingOnScripture!.title })).toBeVisible()
  await expect(highlights.getByText(goingOnQuote)).toBeVisible()
  await expect(highlights.getByRole("link", { name: goingOnScripture!.title })).toHaveCount(0)
  await expect(highlights.locator("li")).toHaveCount(3)
  const scriptureRow = highlights.locator("li").first()
  await expect(scriptureRow.getByRole("heading", { level: 3 })).toHaveText(goingOnScripture!.title)
  await expect(scriptureRow.getByRole("paragraph")).toHaveText(goingOnQuote)
  await expectEventSlot(highlights, slots[0], 1)
  await expectEventSlot(highlights, slots[1], 2)
  await expect(highlights.getByRole("link", { name: slots[0].name })).toHaveCount(0)
  await expect(highlights.getByRole("link", { name: slots[1].name })).toHaveCount(0)
  await expect(highlights.getByRole("link", { name: "Events" })).toHaveAccessibleName("Events")

  const stories = page.getByRole("region", { name: "Highlighted testimonies" })
  expect(testimonyScripture).toBeTruthy()
  const testimonyQuote = curlyQuoted(testimonyScripture!.text!)
  await expect(stories.getByRole("heading", { level: 3, name: testimonyScripture!.title })).toBeVisible()
  await expect(stories.getByText(testimonyQuote)).toBeVisible()
  await expect(stories.locator("article.scripture-tile").getByRole("paragraph")).toHaveText(testimonyQuote)
  await expect(stories.getByRole("link", { name: testimonyScripture!.title })).toHaveCount(0)
  await expect(stories.getByRole("heading", { level: 3, name: "Healing story from Sherman, Illinois" })).toBeVisible()
  await expect(stories.getByRole("link", { name: "Healing story from Sherman, Illinois" })).toHaveCount(0)
  await expect(stories.getByRole("link", { name: "Testimony from California" })).toHaveCount(0)
  await expect(stories.getByRole("link", { name: "Miracle from Dallas" })).toHaveCount(0)
  await expect(stories.getByRole("link", { name: "Praise Reports" })).toHaveCount(0)
  await expect(stories.getByText(testimonySource)).toBeVisible()

  const sermons = page.getByRole("region", { name: "Sermons" })
  const sermonQuote = sermons.locator("blockquote.scripture")
  await expect(sermonQuote.getByRole("paragraph")).toHaveText(scripture)
  await expect(sermonQuote.locator("footer")).toHaveText(scriptureRef)
  await expect(sermons.getByRole("link", { name: "Evangelist Rambabu" })).toHaveCount(0)
  await expect(sermons.getByText("Playlist to be published")).toHaveCount(0)
  await expect(sermons.locator('a[href*="playlist?list="]')).toHaveCount(0)

  const videoLinks = sermons.locator('a[href^="https://www.youtube.com/watch?v="]')
  await expect(videoLinks).toHaveCount(5)
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

test("keeps highlight rows stacked and puts the wide section link beside its heading", async ({ page }) => {
  await page.goto("/")
  const highlights = page.getByRole("region", { name: sections[0] })
  const titles = highlights.getByRole("heading", { level: 3 })
  await expect(titles).toHaveCount(3)
  const tops: number[] = []
  for (const title of await titles.all()) tops.push((await box(title)).y)
  expect(tops[0]).toBeLessThan(tops[1])
  expect(tops[1]).toBeLessThan(tops[2])

  const heading = highlights.getByRole("heading", { level: 2 })
  const eventsLink = highlights.getByRole("link", { name: "Events" })
  const headingBox = await box(heading)
  const eventsBox = await box(eventsLink)
  expect(eventsBox.x).toBeGreaterThan(headingBox.x)
  expect(Math.abs(eventsBox.y - headingBox.y)).toBeLessThan(48)
})

test("uses the wide testimony, sermon, and Sunday compositions", async ({ page }) => {
  await page.goto("/")
  const stories = page.getByRole("region", { name: "Highlighted testimonies" })
  expect(testimonyScripture).toBeTruthy()
  const first = stories.getByRole("heading", { level: 3, name: testimonyScripture!.title })
  const second = stories.getByRole("heading", { level: 3, name: "Healing story from Sherman, Illinois" })
  const third = stories.getByRole("heading", { level: 3, name: "Testimony from California" })
  const fourth = stories.getByRole("heading", { level: 3, name: "Miracle from Dallas" })

  await page.setViewportSize(aboveMenu)
  const articles = stories.locator("article")
  const widths = await articles.evaluateAll((nodes) =>
    nodes.map((article) => article.getBoundingClientRect().width),
  )
  expect(widths).toHaveLength(4)
  // Scripture tile bleeds wider via negative margin; the testimony pair stays equal.
  expect(widths[0]!).toBeGreaterThan(widths[1]!)
  expect(Math.abs(widths[0]! - widths[1]!)).toBeGreaterThan(16)
  expect(Math.abs(widths[2]! - widths[3]!)).toBeLessThan(8)

  const [scriptureTile, healing, california, dallas] = await Promise.all([
    box(articles.nth(0)),
    box(articles.nth(1)),
    box(articles.nth(2)),
    box(articles.nth(3)),
  ])
  expect(Math.abs(scriptureTile.y - healing.y)).toBeLessThan(8)
  expect(scriptureTile.x).toBeLessThan(healing.x)
  expect(Math.abs(california.y - dallas.y)).toBeLessThan(8)
  expect(california.x).toBeLessThan(dallas.x)
  expect(california.y).toBeGreaterThan(scriptureTile.y)
  await expect(first).toBeVisible()
  await expect(second).toBeVisible()
  await expect(third).toBeVisible()
  await expect(fourth).toBeVisible()

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
  expect((await box(first)).y).toBeLessThan((await box(second)).y)
  expect((await box(second)).y).toBeLessThan((await box(third)).y)
  expect((await box(third)).y).toBeLessThan((await box(fourth)).y)
  const rules = await stories.locator("article").evaluateAll((articles) =>
    articles.map((article) => getComputedStyle(article).borderTopWidth),
  )
  expect(rules).toHaveLength(4)
  expect(rules[0]).toBe("0px")
  expect(rules.slice(1).every((width) => width === "1px")).toBe(true)
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
