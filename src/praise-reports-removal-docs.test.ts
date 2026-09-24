import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const root = join(import.meta.dirname, "..")

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8")
}

const destination = /Praise Reports|praise-reports|#praise/

test("praise-reports App Router page is gone so /praise-reports is an unknown route", () => {
  const dir = join(root, "src/app/praise-reports")
  expect(existsSync(join(dir, "page.tsx"))).toBe(false)
  expect(existsSync(join(dir, "page.js"))).toBe(false)
  expect(existsSync(join(dir, "page.jsx"))).toBe(false)
  expect(existsSync(join(dir, "route.ts"))).toBe(false)
  expect(existsSync(join(dir, "route.js"))).toBe(false)
})

test("PRODUCT.md leads into Events, Watch, and Contact Us; routes match Nav", () => {
  const source = read("PRODUCT.md")
  expect(source).toMatch(
    /leads into Events, Watch, and Contact Us/,
  )
  expect(source).toMatch(
    /Routes: Home, About, Events, Watch, Contact Us, Give\./,
  )
  expect(source).not.toMatch(destination)
})

test("Events plan shell sentence covers About, Watch, Contact Us, and Give", () => {
  const source = read("docs/features/events-page/plan.md")
  expect(source).toMatch(
    /shell sentence on About, Watch, Contact Us, and Give/,
  )
  expect(source).not.toMatch(destination)
})

test("Events timeline reference deletes both Praise Reports anchors", () => {
  const source = read(
    "docs/features/events-page/design-reference/05-timeline.html",
  )
  expect(source).not.toMatch(destination)
  expect(source).not.toMatch(/href="#praise"/)
})

test("Home events intent: Highlighted testimonies has no section link", () => {
  const source = read(
    "docs/improvements/home-events-and-scripture-tiles/intent.md",
  )
  expect(source).toMatch(/Highlighted testimonies has no section link/)
  expect(source).not.toMatch(destination)
})

test("Home events plan: source line stays; Praise Reports does not", () => {
  const source = read(
    "docs/improvements/home-events-and-scripture-tiles/plan.md",
  )
  expect(source).toMatch(/source line stay/)
  expect(source).not.toMatch(destination)
})

test("overall feedback element strings drop Praise Reports", () => {
  const source = read("docs/feedback/overall.md")
  const expected = "HomeAboutEventsWatchContact UsGive"
  expect(source).toContain(`footer — Holy Spirit GenerationWord-based. Spirit-filled. Bengaluru.${expected}`)
  expect(source).toContain(`ul — ${expected}`)
  expect(source).not.toMatch(/HomeAboutEventsPraise ReportsWatchContact UsGive/)
})
