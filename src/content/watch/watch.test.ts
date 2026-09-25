import { existsSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

import { playlistThemes, testimonies } from "."

test("lists the four testimonies in intent order with locked names and URLs", () => {
  expect(
    testimonies.map((testimony) => ({
      name: testimony.name,
      url: testimony.url,
    })),
  ).toEqual([
    {
      name: "4th Stage Lung Cancer Healed",
      url: "https://www.instagram.com/reel/DT-AMm_kewV/",
    },
    {
      name: "4th Stage Brain Cancer Healed",
      url: "https://www.instagram.com/reel/DQ__yFACVim/",
    },
    {
      name: "Creative Miracle",
      url: "https://www.instagram.com/reel/DSaHC9JEmiz/",
    },
    {
      name: "Cervical Disk Bulge Healed",
      url: "https://www.instagram.com/reel/DP3qzsLiVuB/",
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
