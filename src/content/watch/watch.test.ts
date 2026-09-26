import { existsSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

import {
  featuredTestimoniesScripture,
  playlistThemes,
  testimonies,
} from "."

test("exports Featured Testimonies Hebrews 2:4 outside the testimonies array", () => {
  expect(featuredTestimoniesScripture).toEqual({
    citation: "Hebrews 2:4",
    text: "God also bearing them witness, both with signs and wonders, and with divers miracles, and gifts of the Holy Ghost",
  })
})

test("keeps Hebrews 2:4 out of the testimonies array", () => {
  expect(testimonies).toHaveLength(4)
  for (const testimony of testimonies) {
    expect(testimony).not.toHaveProperty("citation")
    expect(testimony.name).not.toBe(featuredTestimoniesScripture.citation)
    expect(testimony.title).not.toBe(featuredTestimoniesScripture.citation)
    expect(testimony.writeup).not.toBe(featuredTestimoniesScripture.text)
  }
})

test("lists the four testimonies in intent order with locked records", () => {
  expect(testimonies).toEqual([
    {
      name: "4th Stage Lung Cancer Healed",
      url: "https://www.instagram.com/reel/DT-AMm_kewV/",
      title: "4th Stage Lung Cancer Healed",
      writeup:
        "This brother had a collapsed lung. He was unable to walk but can now run also and is able to go to gym. Hallelujah!",
      thumbnailUrl: "/watch/thangaraj.jpg",
    },
    {
      name: "4th Stage Brain Cancer Healed",
      url: "https://www.instagram.com/reel/DQ__yFACVim/",
      title: "4th Stage Brain Cancer Healed",
      writeup:
        "This girl was suffering severely from Brain Cancer. The Lord healed her completely and she is now able to go to school and enjoy life!",
      thumbnailUrl: "/watch/poorvika.jpg",
    },
    {
      name: "Creative Miracle",
      url: "https://www.instagram.com/reel/DSaHC9JEmiz/",
      title: "Is there anything too hard for the Lord?",
      writeup:
        "This little child was missing an organ from birth. But after prayer, the organ grew back miraculously!",
      thumbnailUrl: "/watch/creative-miracle.jpg",
    },
    {
      name: "Cervical Disk Bulge Healed",
      url: "https://www.instagram.com/reel/DP3qzsLiVuB/",
      title: "Cervical Disk Bulge Healed",
      writeup:
        "Worked in an operation theatre and suffered a cervical disc bulge. The left side of the body would not move. Look what the Lord has done. Hallelujah.",
      thumbnailUrl: "/watch/cervical-disk-bulge.jpg",
    },
  ])
})

test("requires a non-empty title and writeup on every testimony", () => {
  for (const testimony of testimonies) {
    expect(testimony.title.trim().length).toBeGreaterThan(0)
    expect(testimony.writeup.trim().length).toBeGreaterThan(0)
  }
})

test("requires a non-empty thumbnail URL on every testimony", () => {
  for (const testimony of testimonies) {
    expect(testimony.thumbnailUrl.trim().length).toBeGreaterThan(0)
  }
})

test("Instagram testimonies use content-authored thumbnail URLs, not live fetches", () => {
  const instagram = testimonies.filter((testimony) =>
    testimony.url.includes("instagram.com"),
  )
  expect(instagram).toHaveLength(4)
  for (const testimony of instagram) {
    expect(testimony.thumbnailUrl).toMatch(/^\/watch\/.+\.(jpe?g|png|webp)$/i)
    expect(testimony.thumbnailUrl).not.toMatch(/instagram\.com/i)
    const publicPath = join(
      process.cwd(),
      "public",
      testimony.thumbnailUrl.replace(/^\//, ""),
    )
    expect(existsSync(publicPath), publicPath).toBe(true)
  }
})

test("lists sermon playlist themes in intent order with locked names and ids", () => {
  expect(
    playlistThemes.map((theme) => ({
      name: theme.name,
      playlistId: theme.playlistId,
    })),
  ).toEqual([
    {
      name: "Healing",
      playlistId: "PL4sLZ9xdjDfid3If1uvOqlTz9WvGYTN1A",
    },
    {
      name: "Live in Health",
      playlistId: "PLKz6Hr2fQ7Nc",
    },
    {
      name: "Restoration and Recovery",
      playlistId: "PLTXk7vAHmkA0",
    },
    {
      name: "Grow in the Word",
      playlistId: "PL5ah6Wbjftr5aLfOd-3F9nSJiG12XRW5f",
    },
    {
      name: "Conquer Fear",
      playlistId: "PL5ah6Wbjftr4tGpaloXOehqpXB6KwY3zI",
    },
    {
      name: "Mental Health",
      playlistId: "PLWX7FFgYGzyU",
    },
    {
      name: "Excellent Life",
      playlistId: "PLC1s9kXkw278",
    },
    {
      name: "Free sermons",
      playlistId: "PLP2xTHxGd68s",
    },
  ])
})
