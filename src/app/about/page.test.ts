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

function aboutPhoneMediaBlock(css: string): string {
  const marker = "@media (max-width: 800px)"
  let from = 0
  while (from < css.length) {
    const start = css.indexOf(marker, from)
    if (start < 0) {
      throw new Error("no @media (max-width: 800px) block found")
    }
    const open = css.indexOf("{", start)
    let depth = 0
    for (let i = open; i < css.length; i++) {
      const ch = css[i]
      if (ch === "{") depth += 1
      else if (ch === "}") {
        depth -= 1
        if (depth === 0) {
          const block = css.slice(open + 1, i)
          if (block.includes(".about-page .scene")) return block
          from = i + 1
          break
        }
      }
    }
  }
  throw new Error("no about-page phone media block found")
}

test("≤800px about scenes use one-viewport height and flexible plate budget", () => {
  const phoneBlock = aboutPhoneMediaBlock(globalsSource)

  expect(phoneBlock).not.toMatch(/46svh/)
  expect(phoneBlock).not.toMatch(
    /\.about-page\s+\.scene(?:,\s*\.about-page\s+\.scene:nth-of-type\(even\))?\s*\{[^}]*min-height:\s*auto/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.scene(?:,\s*\.about-page\s+\.scene:nth-of-type\(even\))?\s*\{[^}]*(?:min-)?height:\s*100svh/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.scene(?:,\s*\.about-page\s+\.scene:nth-of-type\(even\))?\s*\{[^}]*grid-template-rows:\s*auto\s+minmax\(\s*0\s*,\s*1fr\s*\)/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.plate\s*\{[^}]*(?:min-height:\s*0|flex:\s*1)/,
  )
  expect(phoneBlock).toMatch(/#founders\s+\.plate\s*\{[^}]*background-position:/)
  expect(phoneBlock).toMatch(/#the-call\s+\.plate\s*\{[^}]*background-position:/)
  expect(phoneBlock).toMatch(/#nations\s+\.plate\s*\{[^}]*background-position:/)
  expect(globalsSource).toMatch(
    /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{[^}]*html:has\(\.about-page\)\s*\{[^}]*scroll-snap-type:\s*none/,
  )
})
