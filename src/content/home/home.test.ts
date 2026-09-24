import { expect, test } from "vitest"

import {
  church,
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

test("carries the three page notes sections do not", () => {
  expect(pageNotes).toEqual({
    testimonies: "Stories adapted from Rambo World Outreach.",
    sunday: "Sunday services · Namma Bengaluru",
    ministry: "New Creation Ministries",
    address:
      "NC Arena #3 Near Legacy School & Moto Mind Shop Byrithi, Village, Kothanur, Bengaluru, Karnataka 560077",
  })
})

test("lists sections in order", () => {
  expect(sections.map((section) => section.heading)).toEqual([
    "What’s going on",
    "Highlighted testimonies",
    "New to HSG?",
    "Sermons",
  ])
})

test("lists public navigation in order", () => {
  expect(nav).toEqual([
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "Praise Reports", href: "/praise-reports" },
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
    { title: "Word Fest Service", text: "English\n8–9am" },
    {
      title: "Miracles and Healing Service",
      text: "Multilingual\n9:30am onwards",
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

test("puts Acts 2:46 scripture first in What’s going on", () => {
  const goingOn = sections.find((section) => section.heading === "What’s going on")
  expect(goingOn?.more).toEqual({ label: "Events", href: "/events" })
  expect(goingOn?.items[0]).toEqual({
    title: "Acts 2:46 (AMP)",
    text: "And day after day they regularly assembled in the temple with united purpose... with gladness and simplicity and generous hearts",
  })
  expect(goingOn?.items[0]?.href).toBeUndefined()
})

test("puts Hebrews 2:4 scripture first in Highlighted testimonies", () => {
  const testimonies = sections.find(
    (section) => section.heading === "Highlighted testimonies",
  )
  expect(testimonies?.more).toEqual({
    label: "Praise Reports",
    href: "/praise-reports",
  })
  expect(testimonies?.items).toEqual([
    {
      title: "Hebrews 2:4 (KJV)",
      text: "God also bearing them witness, both with signs and wonders, and with divers miracles, and gifts of the Holy Ghost",
    },
    {
      title: "Healing story from Sherman, Illinois",
      text: "A woman had lived for three decades with double scoliosis, a missing rib, and four back surgeries.",
    },
    {
      title: "Testimony from California",
      text: "A woman had severe migraine for seven years and could not bear sunlight or ordinary sound. Apostle Rambabu laid hands on her and said “Restore,” and the migraine ended.",
    },
    {
      title: "Miracle from Dallas",
      text: "A woman had been deaf in her left ear since childhood. She began to hear after Apostle Rambabu called out her condition and cast his shadow on her.",
    },
  ])
  expect(
    testimonies?.items.every((item) => item.href === undefined),
  ).toBe(true)
})

test("gives section items no URLs", () => {
  const linked = sections.flatMap((section) =>
    section.items.filter((item) => item.href),
  )
  expect(linked).toEqual([])
})
