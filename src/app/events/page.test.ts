import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "page.tsx"), "utf8")
const homeSource = readFileSync(join(import.meta.dirname, "../page.tsx"), "utf8")

test("Events is force-dynamic, lists upcoming at request time, and does not revalidate", () => {
  expect(source).toMatch(/export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/)
  expect(source).toMatch(/listUpcoming\s*\(\s*events\s*,\s*new Date\s*\(\s*\)\s*\)/)
  expect(source).not.toMatch(/\brevalidate\b/)
})

test("Home uses event slots at request time; Events lists upcoming directly", () => {
  expect(homeSource).toMatch(/export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/)
  expect(homeSource).toMatch(/@\/content\/events/)
  expect(homeSource).toMatch(/homeEventSlots/)
  expect(homeSource).not.toMatch(/listUpcoming/)
  expect(source).toMatch(/listUpcoming\s*\(\s*events\s*,\s*new Date\s*\(\s*\)\s*\)/)
})

test("document title is Events; h1 Events; no IST note or placeholders", () => {
  expect(source).toMatch(/title:\s*["']Events["']/)
  expect(source).toMatch(/>\s*Events\s*</)
  expect(source).not.toMatch(/Times are in IST/)
  expect(source).not.toMatch(/Names and photographs are placeholders/)
  expect(source).not.toMatch(/Placeholder photograph/)
  expect(source).not.toMatch(/This page will be published here/)
})

test("featured rows use cobalt breakout with h2, when-line, optional description and photo, then scope", () => {
  expect(source).toMatch(/className=["'][^"']*breakout/)
  expect(source).toMatch(/<h2[\s\S]*?\{?row\.name|event\.name|featured/)
  expect(source).toMatch(/whenLine|when-line|className=["']when["']/)
  expect(source).toMatch(/description/)
  expect(source).toMatch(/next\/image|from\s+["']next\/image["']/)
  expect(source).toMatch(/photo\.alt/)
  expect(source).toMatch(/This date only\.|scope/)
  expect(source).not.toMatch(/\bvenue\b/i)
})

test("minor rows use h3, when-line, and scope without photo or description", () => {
  expect(source).toMatch(/className=["'][^"']*minor/)
  expect(source).toMatch(/<h3/)
})

test("zero listed events render empty copy; Sunday services stay without the intro", () => {
  expect(source).toMatch(/No upcoming events\./)
  expect(source).toMatch(/Sunday services/)
  expect(source).not.toMatch(/Not on the dated line/)
  expect(source).toMatch(/Multilingual · AI Powered/)
})

test("Sunday services keep Home name, language, and time; page text has no 1:30", () => {
  expect(source).toMatch(/New to HSG\?|sections/)
  expect(source).toMatch(/item\.text/)
  expect(source).toMatch(/item\.title/)
  expect(source).not.toMatch(/1:30/)
  expect(source).not.toMatch(/13:30/)
})

test("dated rows do not show the subscribe refresh note; page does not say Added", () => {
  expect(source).not.toMatch(
    /Subscribing follows a later published time after your calendar refreshes\./,
  )
  expect(source).not.toMatch(/className=["']scope["']/)
  expect(source).not.toMatch(/["']Added["']|>Added</)
})

test("Host header seeds AddToCalendar; one control per dated row and Sunday service", () => {
  expect(source).toMatch(/from\s+["']next\/headers["']/)
  expect(source).toMatch(/headers\s*\(/)
  expect(source).toMatch(/["']host["']/)
  expect(source).toMatch(/<AddToCalendar\b/)
  expect(source).toMatch(/sundayFeeds|word-fest/)
})
