import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

import { eventHighlights } from "."

const JPEG_SOI = Buffer.from([0xff, 0xd8])

const expectedPosters = [
  {
    title: "Together Youth Night Highlights",
    thumbnailUrl: "/home/together-youth-night.jpg",
    fileName: "together-youth-night.jpg",
  },
  {
    title: "Recent Service Recap",
    thumbnailUrl: "/home/recent-service-recap.jpg",
    fileName: "recent-service-recap.jpg",
  },
] as const

function publicPathFor(thumbnailUrl: string): string {
  return join(process.cwd(), "public", thumbnailUrl.replace(/^\//, ""))
}

function assertNonEmptyJpeg(path: string) {
  expect(existsSync(path), path).toBe(true)
  expect(statSync(path).size, path).toBeGreaterThan(0)
  const bytes = readFileSync(path)
  expect(bytes.subarray(0, 2).equals(JPEG_SOI), `${path} must start with JPEG SOI`).toBe(
    true,
  )
}

test("ships both home event-highlight posters under public/home/", () => {
  for (const poster of expectedPosters) {
    assertNonEmptyJpeg(join(process.cwd(), "public/home", poster.fileName))
  }
})

test("eventHighlights thumbnailUrl values point at the committed posters and are non-empty", () => {
  expect(eventHighlights).toHaveLength(expectedPosters.length)

  for (const [index, expected] of expectedPosters.entries()) {
    const highlight = eventHighlights[index]
    expect(highlight?.title).toBe(expected.title)
    expect(highlight?.thumbnailUrl.trim().length).toBeGreaterThan(0)
    expect(highlight?.thumbnailUrl).toBe(expected.thumbnailUrl)
    expect(highlight?.thumbnailUrl).not.toMatch(/instagram\.com/i)

    assertNonEmptyJpeg(publicPathFor(highlight!.thumbnailUrl))
  }
})
