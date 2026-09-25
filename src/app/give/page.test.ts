import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "page.tsx"), "utf8")
const globalsSource = readFileSync(
  join(import.meta.dirname, "../globals.css"),
  "utf8",
)

test("document title is Give; page has no shell sentence", () => {
  expect(source).toMatch(/title:\s*["']Give["']/)
  expect(source).not.toMatch(/This page will be published here/)
})

test("imports give content and anchors #main-content", () => {
  expect(source).toMatch(/from\s+["']@\/content\/give["']/)
  expect(source).toMatch(/id=["']main-content["']/)
  expect(source).toMatch(/\bscripture\b/)
  expect(source).toMatch(/\bwhyWeGive\b/)
  expect(source).toMatch(/\bgiveCta\b/)
  expect(source).toMatch(/\bhelpBar\b/)
})

test("h1 is Why we give; GIVE uses G7 new-tab attrs", () => {
  expect(source).toMatch(/<h1[\s\S]*?whyWeGive\.heading/)
  expect(source).toMatch(
    /href=\{giveCta\.href\}[^>]*target=["']_blank["'][^>]*rel=["']noopener noreferrer["']|href=\{giveCta\.href\}[^>]*rel=["']noopener noreferrer["'][^>]*target=["']_blank["']/,
  )
  expect(source).toMatch(/\{giveCta\.label\}/)
})

test("help bar is a sibling after #main-content; tel and mailto omit target blank", () => {
  const mainClose = source.search(/<\/main>/)
  const helpPhone = source.search(/helpBar\.phone/)
  const helpEmail = source.search(/helpBar\.email/)
  expect(mainClose).toBeGreaterThan(-1)
  expect(helpPhone).toBeGreaterThan(mainClose)
  expect(helpEmail).toBeGreaterThan(mainClose)

  const afterMain = source.slice(mainClose)
  expect(afterMain).toMatch(/href=\{helpBar\.phone\.href\}/)
  expect(afterMain).toMatch(/href=\{helpBar\.email\.href\}/)
  expect(afterMain).not.toMatch(
    /href=\{helpBar\.phone\.href\}[^>]*target=["']_blank["']/,
  )
  expect(afterMain).not.toMatch(
    /href=\{helpBar\.email\.href\}[^>]*target=["']_blank["']/,
  )
  expect(afterMain).not.toMatch(/target=["']_blank["']/)
})

test("give CSS is scoped under .give-page", () => {
  expect(globalsSource).toMatch(/\.give-page\b/)
  expect(globalsSource).toMatch(/\.give-page[\s\S]*give-leaflet|\.give-page\s+\.give-leaflet/)
  expect(globalsSource).toMatch(/\.give-page[\s\S]*give-help|\.give-page\s+\.give-help/)
})
