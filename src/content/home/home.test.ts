import { expect, test } from "vitest"

import {
  church,
  eventHighlights,
  leader,
  nav,
  pageNotes,
  sections,
  sermonPlaylistId,
} from "."

test("names the church and states the blurb", () => {
  expect(church.name).toBe("Holy Spirit Generation")
  expect(leader.name).toBe("Apostle Dr. P. S. Rambabu")
  expect(leader.blurb).toBe(
    "A Word-based, Spirit-filled church in Bengaluru, founded and led by Apostle Dr. P. S. Rambabu and Pastor Vinita Rambabu.",
  )
  expect(leader.portrait).toBeNull()
})

test("carries sunday, ministry, and address page notes without testimonies", () => {
  expect(pageNotes).toEqual({
    sunday: "Sunday services · Namma Bengaluru",
    ministry: "New Creation Ministries",
    address:
      "NC Arena #3 Near Legacy School & Moto Mind Shop Byrithi, Village, Kothanur, Bengaluru, Karnataka 560077",
  })
  expect(pageNotes).not.toHaveProperty("testimonies")
})

test("lists sections in order without Highlighted testimonies", () => {
  expect(sections.map((section) => section.heading)).toEqual([
    "What’s going on",
    "New to HSG?",
    "Sermons",
  ])
})

test("lists public navigation in order", () => {
  expect(nav).toEqual([
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "Watch", href: "/watch" },
    { label: "Contact Us", href: "/contact" },
    { label: "Give", href: "/give" },
  ])
})

test("keeps Sunday service names, languages, and times", () => {
  const services = sections.find((section) => section.heading === "New to HSG?")
  expect(services?.intro).toBe(
    "Join us every Sunday to worship the Lord together and celebrate his goodness in our lives",
  )
  expect(services?.items).toEqual([
    { title: "Word Fest Service", text: "English\n08:00–09:00" },
    {
      title: "Miracles and Healing Service",
      text: "Multilingual\n09:30 onwards",
    },
  ])
  expect(services?.more).toEqual({ label: "Know More", href: "/contact" })
})

test("exports the sermon playlist id", () => {
  expect(sermonPlaylistId).toBe("PLWX7FFgYGzyU")
})

test("quotes Proverbs 4:20-21 in the sermon panel", () => {
  const sermons = sections.find((section) => section.heading === "Sermons")
  expect(sermons?.intro).toBe(
    "My son, attend to my words; incline thine ear unto my sayings. Let them not depart from thine eyes; keep them in the midst of thine heart.",
  )
  expect(sermons?.items).toEqual([{ title: "Proverbs 4:20-21" }])
  expect(sermons?.more).toEqual({ label: "Watch", href: "/watch" })
})

test("has no Playlist to be published item titles", () => {
  const titles = sections.flatMap((section) =>
    section.items.map((item) => item.title),
  )
  expect(titles).not.toContain("Playlist to be published")
})

test("has no Highlight to be published item titles", () => {
  const titles = sections.flatMap((section) =>
    section.items.map((item) => item.title),
  )
  expect(titles).not.toContain("Highlight to be published")
})

test("puts Acts 2:46 scripture alone in What’s going on with Events link", () => {
  const goingOn = sections.find((section) => section.heading === "What’s going on")
  expect(goingOn?.more).toEqual({ label: "Events", href: "/events" })
  expect(goingOn?.items).toEqual([
    {
      title: "Acts 2:46",
      text: "And day after day they regularly assembled in the temple with united purpose... with gladness and simplicity and generous hearts",
    },
  ])
  expect(goingOn?.items[0]?.href).toBeUndefined()
})

test("exports eventHighlights in intent order with title, url, and thumbnailUrl", () => {
  expect(eventHighlights).toEqual([
    {
      title: "Together Youth Night Highlights",
      url: "https://www.instagram.com/reel/DclzTz2TnWk/",
      thumbnailUrl: "/home/together-youth-night.jpg",
    },
    {
      title: "Recent Service Recap",
      url: "https://www.instagram.com/reel/DdQZhQNTH6S/",
      thumbnailUrl: "/home/recent-service-recap.jpg",
    },
  ])
})

test("event highlight thumbnails are content-authored public/home paths, not Instagram fetches", () => {
  expect(eventHighlights).toHaveLength(2)
  for (const highlight of eventHighlights) {
    expect(highlight.thumbnailUrl.trim().length).toBeGreaterThan(0)
    expect(highlight.thumbnailUrl).toMatch(/^\/home\/.+\.(jpe?g|png|webp)$/i)
    expect(highlight.thumbnailUrl).not.toMatch(/instagram\.com/i)
    expect(highlight.url).toMatch(/^https:\/\/www\.instagram\.com\/reel\//)
  }
})

test("does not keep Hebrews or testimony stories in Home sections", () => {
  const titles = sections.flatMap((section) =>
    section.items.map((item) => item.title),
  )
  expect(titles).not.toContain("Hebrews 2:4 (KJV)")
  expect(titles).not.toContain("Healing story from Sherman, Illinois")
  expect(titles).not.toContain("Testimony from California")
  expect(titles).not.toContain("Miracle from Dallas")
})

test("gives section items no URLs", () => {
  const linked = sections.flatMap((section) =>
    section.items.filter((item) => item.href),
  )
  expect(linked).toEqual([])
})
