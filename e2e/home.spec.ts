import { expect, test } from "@playwright/test"

import {
  absentReferenceCopy,
  blurb,
  scripture,
  scriptureRef,
  churchName,
  footerAddress,
  ministryName,
  playlistUrl,
  sections,
  sundayNote,
  testimonySource,
} from "./copy"
import { aboveMenu, atMenu, box, desktop, headerNav, paintedBackground } from "./helpers"

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktop)
})

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

test("keeps unpublished highlights and shows the sermon series with Watch", async ({ page }) => {
  await page.goto("/")

  const highlights = page.getByRole("region", { name: sections[0] })
  await expect(highlights.getByText("Highlight to be published")).toHaveCount(3)
  await expect(highlights.getByRole("link", { name: "Highlight to be published" })).toHaveCount(0)
  await expect(highlights.getByRole("link", { name: "Events" })).toHaveAccessibleName("Events")

  const stories = page.getByRole("region", { name: "Highlighted testimonies" })
  await expect(stories.getByRole("heading", { level: 3, name: "Healing story from Sherman, Illinois" })).toBeVisible()
  await expect(stories.getByRole("link", { name: "Healing story from Sherman, Illinois" })).toHaveCount(0)
  await expect(stories.getByRole("link", { name: "Testimony from California" })).toHaveCount(0)
  await expect(stories.getByRole("link", { name: "Miracle from Dallas" })).toHaveCount(0)
  await expect(stories.getByRole("link", { name: "Praise Reports" })).toHaveAttribute("href", "/praise-reports")

  const sermons = page.getByRole("region", { name: "Sermons" })
  await expect(sermons.getByText(scripture)).toBeVisible()
  await expect(sermons.getByText(scriptureRef)).toBeVisible()
  await expect(sermons.getByRole("link", { name: "Evangelist Rambabu" })).toHaveCount(0)
  await expect(sermons.getByText("Playlist to be published")).toHaveCount(0)

  const series = sermons.locator(`a[href="${playlistUrl}"]`)
  await expect(series).toHaveCount(1)
  const seriesText = (await series.innerText()).trim()
  expect(seriesText.length).toBeGreaterThan(0)
  await expect(series).toHaveAccessibleName(seriesText)
  await expect(series).toHaveAttribute("target", "_blank")

  const videoLinks = sermons.locator('a[href^="https://www.youtube.com/watch?v="]')
  await expect(videoLinks).toHaveCount(4)
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
  await expect(videoLinks).toHaveCount(4)
  for (const link of await videoLinks.all()) {
    const title = (await link.innerText()).trim()
    expect(title.length).toBeGreaterThan(0)
    await expect(link).toBeVisible()
    await expect(link.getByText(title)).toBeVisible()
  }
})

test("reads both Sunday services with Contact Us and no visit claim", async ({ page }) => {
  await page.goto("/")
  const sunday = page.getByRole("region", { name: "New to HSG" })
  const text = await sunday.innerText()
  const word = text.indexOf("Word Fest Service")
  const english = text.indexOf("English")
  const morning = text.indexOf("8\u20139am")
  const healing = text.indexOf("Miracles and Healing Service")
  const multilingual = text.indexOf("Multilingual")
  const onwards = text.indexOf("9:30am onwards")
  const note = text.indexOf(sundayNote)
  expect(word).toBeGreaterThan(-1)
  expect(word).toBeLessThan(english)
  expect(english).toBeLessThan(morning)
  expect(morning).toBeLessThan(healing)
  expect(healing).toBeLessThan(multilingual)
  expect(multilingual).toBeLessThan(onwards)
  expect(onwards).toBeLessThan(note)
  await expect(sunday.getByRole("link", { name: "Contact Us" })).toBeVisible()
  await expect(sunday.getByText(/direction|booking|reserve/i)).toHaveCount(0)
})

test("opens a sermon video and the series in a new tab", async ({ page }) => {
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

  const series = sermons.locator(`a[href="${playlistUrl}"]`)
  const seriesPopup = page.waitForEvent("popup")
  await series.click()
  const seriesPage = await seriesPopup
  await expect(seriesPage).toHaveURL(playlistUrl)
  await expect(page.getByRole("heading", { level: 1, name: churchName })).toBeVisible()
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
  const events = highlights.getByRole("link", { name: "Events" })
  const headingBox = await box(heading)
  const eventsBox = await box(events)
  expect(eventsBox.x).toBeGreaterThan(headingBox.x)
  expect(Math.abs(eventsBox.y - headingBox.y)).toBeLessThan(48)
})

test("uses the wide testimony, sermon, and Sunday compositions", async ({ page }) => {
  await page.goto("/")
  const stories = page.getByRole("region", { name: "Highlighted testimonies" })
  const first = stories.getByRole("heading", { level: 3, name: "Healing story from Sherman, Illinois" })
  const second = stories.getByRole("heading", { level: 3, name: "Testimony from California" })
  const third = stories.getByRole("heading", { level: 3, name: "Miracle from Dallas" })
  const widths = await stories.locator("h3").evaluateAll((headings) =>
    headings.map((heading) => heading.parentElement?.getBoundingClientRect().width ?? 0),
  )
  expect(widths).toHaveLength(3)
  expect(widths[0]).toBeGreaterThan(widths[1])
  expect(Math.abs(widths[1] - widths[2])).toBeLessThan(8)
  expect(Math.abs((await box(first)).y - (await box(second)).y)).toBeLessThan(8)
  expect((await box(second)).x).toBeLessThan((await box(third)).x)

  const sermons = page.getByRole("region", { name: "Sermons" })
  const channel = sermons.locator(".channel")
  const series = sermons.locator(`a[href="${playlistUrl}"]`)
  const channelBox = await box(channel)
  const seriesBox = await box(series)
  expect(channelBox.x).toBeLessThan(seriesBox.x)
  expect(Math.abs(channelBox.y - seriesBox.y)).toBeLessThan(4)

  const sunday = page.getByRole("region", { name: "New to HSG" })
  const contact = sunday.getByRole("link", { name: "Contact Us" })
  const time = sunday.getByText("8\u20139am")
  expect((await box(contact)).x).toBeLessThan((await box(time)).x)

  await page.setViewportSize(atMenu)
  expect((await box(first)).y).toBeLessThan((await box(second)).y)
  expect((await box(channel)).y).toBeLessThan((await box(series)).y)
  expect((await box(contact)).y).toBeLessThan((await box(time)).y)
})

test("names the brand from the logo and keeps routes in the header only", async ({ page }) => {
  await page.goto("/")
  const brand = page.getByRole("link", { name: churchName })
  await expect(brand).toHaveCount(1)
  await expect(brand).toHaveAttribute("href", "/")
  expect((await brand.innerText()).trim()).toBe("")
  await expect(headerNav(page).getByRole("link")).toHaveText([
    "Home",
    "About",
    "Events",
    "Praise Reports",
    "Watch",
    "Contact Us",
    "Give",
  ])
  await expect(page.getByRole("contentinfo").getByRole("link")).toHaveCount(0)
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
