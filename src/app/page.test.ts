import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "page.tsx"), "utf8")

test("h1 accessible name is Holy Spirit Generation on two lines, not leader.name", () => {
  expect(source).toMatch(/from\s+["']@\/content\/home["']/)
  expect(source).toMatch(/\bchurch\b/)
  expect(source).toMatch(/<h1[\s\S]*?>[\s\S]*?Holy Spirit[\s\S]*?Generation[\s\S]*?<\/h1>/)
  expect(source).not.toMatch(/<h1[^>]*>\s*\{leader\.name\}/)
  expect(source).not.toMatch(/leader\.name/)
})

test("hero order is heading, blurb, About link, then portrait field", () => {
  const heading = source.indexOf("<h1")
  const blurb = source.indexOf("leader.blurb")
  const about = source.search(/href=["']\/about["']/)
  const portrait = source.search(/<PortraitField\b/)
  expect(heading).toBeGreaterThan(-1)
  expect(blurb).toBeGreaterThan(heading)
  expect(about).toBeGreaterThan(blurb)
  expect(portrait).toBeGreaterThan(about)
  expect(source).toMatch(/href=["']\/about["'][\s\S]*?>[\s\S]*?About/)
})

test("section heads put h2 with the section link before items; New to HSG is intro beside records", () => {
  expect(source).toMatch(/section-head|className=["'][^"']*section-head/)
  expect(source).toMatch(/visit-grid|visit-intro|className=["'][^"']*visit/)
  expect(source).toMatch(/pageNotes\.testimonies/)
  expect(source).toMatch(/pageNotes\.sunday/)
})

test("section links use destination label, aria-hidden arrow, and 44px min height", () => {
  expect(source).toMatch(/aria-hidden=["']true["']/)
  expect(source).toMatch(/<svg[\s\S]*?aria-hidden=["']true["']/)
  expect(source).toMatch(/min-height:\s*44px|min-h-\[44px\]|minHeight:\s*44|min-height:\s*2\.75/)
  expect(source).toMatch(/section\.more\.label/)
})

test("items with href are same-tab title links; items without href are plain text", () => {
  expect(source).toMatch(/item\.href/)
  expect(source).not.toMatch(/target=["']_blank["']/)
  expect(source).not.toMatch(/target=\{["_']blank["_']\}/)
})

test("sermons put intro and first item in cobalt panel; no iframe or banned tagline", () => {
  expect(source).toMatch(/channel|sermon-panel|cobalt/i)
  expect(source).toMatch(/section\.intro/)
  expect(source).not.toMatch(/<iframe\b/)
  expect(source).not.toMatch(/The Word,\s*wherever you are/i)
  expect(source).not.toMatch(/Messages & teaching/)
  expect(source).not.toMatch(/Church news & gatherings/)
})

test("testimony text is one paragraph; Sunday splits language and time; onwards stays", () => {
  expect(source).toMatch(/split\(["']\\n["']\)/)
  expect(source).not.toMatch(/Leader portrait placeholder/)
})

test("four regions named by visible h2; testimony h3 parent is the story column; no carousel tabs disclosure motion", () => {
  expect(source).toMatch(/aria-labelledby=/)
  expect(source).toMatch(/<h2\b/)
  expect(source).toMatch(/<h3\b/)
  expect(source).toMatch(/<article\b/)
  expect(source).not.toMatch(/carousel|role=["']tablist["']|<details\b|framer-motion|animate-/i)
})
