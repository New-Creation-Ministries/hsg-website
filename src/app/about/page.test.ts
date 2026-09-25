import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "page.tsx"), "utf8")
const dotsSource = readFileSync(
  join(import.meta.dirname, "../../components/about-scene-dots.tsx"),
  "utf8",
)
const globalsSource = readFileSync(
  join(import.meta.dirname, "../globals.css"),
  "utf8",
)

test("document title is About; page has no shell sentence", () => {
  expect(source).toMatch(/title:\s*["']About["']/)
  expect(source).not.toMatch(/This page will be published here/)
})

test("renders scenes from about content with main-content and scene dots", () => {
  expect(source).toMatch(/from\s+["']@\/content\/about["']/)
  expect(source).toMatch(/id=["']main-content["']/)
  expect(source).toMatch(/AboutSceneDots/)
  expect(source).toMatch(/from\s+["']@\/components\/about-scene-dots["']/)
  expect(source).toMatch(/storyContinuesServices|storyContinuesAddress/)
})

test("scene dots are a client module that sets aria-current from intersection", () => {
  expect(dotsSource).toMatch(/["']use client["']/)
  expect(dotsSource).toMatch(/IntersectionObserver/)
  expect(dotsSource).toMatch(/aria-current/)
  expect(dotsSource).toMatch(/aria-label=["']Scenes["']/)
})

test("scenes CSS is scoped to .about-page and ships no entrance motion kit", () => {
  expect(globalsSource).toMatch(/\.about-page\s+\.scene\b|\.about-page\.scene\b|\.about-page\s*\{[^}]*\}[\s\S]*\.scene/)
  expect(globalsSource).toMatch(/\.about-page[\s\S]*scroll-snap-align:\s*start/)
  expect(globalsSource).not.toMatch(/@keyframes\s+(fade|slide)/i)
  expect(globalsSource).not.toMatch(/animation:\s*[^;]*(fade|slide)/i)
})
