import { expect, test } from "vitest"

import { church, leader, nav, pageNotes, sections } from "."

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
    sunday: "Sunday services · Bengaluru local time",
    footer: "Word-based. Spirit-filled. Bengaluru.",
  })
})

test("lists sections in order", () => {
  expect(sections.map((section) => section.heading)).toEqual([
    "What’s going on",
    "Highlighted testimonies",
    "Sermons",
    "New to HSG",
  ])
})

test("lists public navigation in order", () => {
  expect(nav).toEqual([
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "Praise Reports", href: "/praise-reports" },
    { label: "Watch", href: "/watch" },
    { label: "Contact Us", href: "/contact" },
    { label: "Give", href: "/give" },
  ])
})

test("keeps Sunday service names, languages, and times", () => {
  const services = sections.find((section) => section.heading === "New to HSG")
  expect(services?.intro).toBe("Join us every Sunday.")
  expect(services?.items).toEqual([
    { title: "Word Fest Service", text: "English\n8–9am" },
    {
      title: "Miracles and Healing Service",
      text: "Multilingual\n9:30am onwards",
    },
  ])
  expect(services?.more).toEqual({ label: "Contact Us", href: "/contact" })
})

test("gives a URL only to the Evangelist Rambabu channel", () => {
  const linked = sections.flatMap((section) =>
    section.items.filter((item) => item.href),
  )
  expect(linked).toEqual([
    {
      title: "Evangelist Rambabu",
      href: "https://www.youtube.com/c/EvangelistRambabuRambo",
    },
  ])
})
