import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

import { sections } from "@/content/home"

const source = readFileSync(join(import.meta.dirname, "page.tsx"), "utf8")
const homeSource = readFileSync(join(import.meta.dirname, "../page.tsx"), "utf8")
const repoRoot = join(import.meta.dirname, "../..")

const visitSection = sections.find((section) => section.heading === "New to HSG?")

test("Events revalidates hourly, lists upcoming, and is not force-dynamic", () => {
  expect(source).toMatch(/export\s+const\s+revalidate\s*=\s*3600/)
  expect(source).not.toMatch(/export\s+const\s+dynamic\s*=/)
  expect(source).not.toMatch(/force-dynamic/)
  expect(source).toMatch(/listUpcoming\s*\(\s*events\s*,\s*new Date\s*\(\s*\)\s*\)/)
})

test("Home does not use event slots; Events lists upcoming directly", () => {
  expect(existsSync(join(repoRoot, "src/lib/home-event-slots.ts"))).toBe(false)
  expect(existsSync(join(repoRoot, "src/lib/home-event-slots.test.ts"))).toBe(
    false,
  )
  expect(homeSource).not.toMatch(/@\/content\/events/)
  expect(homeSource).not.toMatch(/homeEventSlots/)
  expect(homeSource).not.toMatch(/listUpcoming/)
  expect(homeSource).not.toMatch(/@\/lib\/home-event-slots/)
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

test("Sunday services keep Home New to HSG? names and times after home-event-slots removal", () => {
  expect(source).toMatch(/sections\.find\(\(section\) => section\.heading === ["']New to HSG\?["']\)/)
  expect(source).toMatch(/item\.text/)
  expect(source).toMatch(/item\.title/)
  expect(source).toMatch(/sundayClock/)
  expect(source).toMatch(/onwards/i)
  expect(source).not.toMatch(/1:30/)
  expect(source).not.toMatch(/13:30/)
  expect(source).not.toMatch(/homeEventSlots/)

  expect(visitSection).toBeDefined()
  expect(visitSection!.items).toEqual([
    { title: "Word Fest Service", text: "English\n08:00–09:00" },
    {
      title: "Miracles and Healing Service",
      text: "Multilingual\n09:30 onwards",
    },
  ])
})

test("dated rows do not show the subscribe refresh note; page does not say Added", () => {
  expect(source).not.toMatch(
    /Subscribing follows a later published time after your calendar refreshes\./,
  )
  expect(source).not.toMatch(/className=["']scope["']/)
  expect(source).not.toMatch(/["']Added["']|>Added</)
})

test("siteHost seeds AddToCalendar; no request headers; one control per dated row and Sunday service", () => {
  expect(source).toMatch(/from\s+["']@\/lib\/site-host["']/)
  expect(source).not.toMatch(/from\s+["']next\/headers["']/)
  expect(source).not.toMatch(/headers\s*\(/)
  expect(source).toMatch(/<AddToCalendar\b/)
  expect(source).toMatch(/sundayFeeds|word-fest/)

  const calendars = [...source.matchAll(/<AddToCalendar\b[\s\S]*?\/>/g)].map(
    (match) => match[0],
  )
  expect(calendars.length).toBeGreaterThan(0)
  for (const calendar of calendars) {
    expect(calendar).toMatch(/host=\{siteHost\}/)
  }
})
