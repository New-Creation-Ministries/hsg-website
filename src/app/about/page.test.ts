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

test("About snap port is zero while other routes keep 6.5rem scroll padding", () => {
  expect(globalsSource).toMatch(
    /html\s*\{[^}]*scroll-padding-top:\s*6\.5rem/,
  )
  expect(globalsSource).toMatch(
    /html:has\(\.about-page\)\s*\{[^}]*scroll-padding-top:\s*0/,
  )
})

test("≤800px about scenes use one-viewport height, copy, and flexible plate budget", () => {
  const phoneBlock = aboutPhoneMediaBlock(globalsSource)

  expect(phoneBlock).not.toMatch(/46svh/)
  expect(phoneBlock).not.toMatch(
    /\.about-page\s+\.scene(?:,\s*\.about-page\s+\.scene:nth-of-type\(even\))?\s*\{[^}]*min-height:\s*auto/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.scene(?:,\s*\.about-page\s+\.scene:nth-of-type\(even\))?\s*\{[^}]*height:\s*100svh/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.scene(?:,\s*\.about-page\s+\.scene:nth-of-type\(even\))?\s*\{[^}]*max-height:\s*100svh/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.scene(?:,\s*\.about-page\s+\.scene:nth-of-type\(even\))?\s*\{[^}]*grid-template-rows:\s*auto\s+minmax\(\s*0\s*,\s*1fr\s*\)/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.plate\s*\{[^}]*min-height:\s*0/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.copy\s*\{[^}]*padding:\s*1\.4rem\s+1\.2rem\s+1\.1rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.copy\s*\{[^}]*min-height:\s*0/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.copy\s+h1,\s*\.about-page\s+\.copy\s+h2\s*\{[^}]*font-size:\s*clamp\(\s*2\.35rem\s*,\s*11vw\s*,\s*3\.2rem\s*\)/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.copy\s+h1,\s*\.about-page\s+\.copy\s+h2\s*\{[^}]*margin-bottom:\s*0\.65rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.copy\s+p\s*\{[^}]*font-size:\s*0\.95rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.copy\s+p\s*\{[^}]*line-height:\s*1\.45/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.copy\s+p\s*\+\s*p\s*\{[^}]*margin-top:\s*0\.55rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.plate\.band\s*\{[^}]*padding:\s*1\.2rem/,
  )
  expect(phoneBlock).not.toMatch(
    /\.about-page\s+\.plate\.band\s*\{[^}]*padding:\s*1\.2rem\s+1\.2rem\s+4\.25rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.times\s*\{[^}]*gap:\s*0\.55rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.times\s*\{[^}]*margin-top:\s*0\.65rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.times\s+h3\s*\{[^}]*font-size:\s*1\.1rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.times\s+\.service-language\s*\{[^}]*font-size:\s*0\.9rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.times\s+article\s*>\s*p:last-child\s*\{[^}]*font-size:\s*1\.55rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.address\s*\{[^}]*margin-top:\s*0\.65rem/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.address\s*\{[^}]*font-size:\s*0\.95rem/,
  )
})

test("≤800px about plates keep cover positions and contain treatment", () => {
  const phoneBlock = aboutPhoneMediaBlock(globalsSource)

  expect(phoneBlock).toMatch(
    /#founders\s+\.plate\s*\{[^}]*background-position:\s*center\s+18%/,
  )
  expect(phoneBlock).toMatch(
    /#the-call\s+\.plate\s*\{[^}]*background-position:\s*center\s+58%/,
  )
  expect(phoneBlock).toMatch(
    /#nations\s+\.plate\s*\{[^}]*background-position:\s*center\s+42%/,
  )
  expect(phoneBlock).not.toMatch(
    /#founders\s+\.plate\s*\{[^}]*background-size/,
  )
  expect(phoneBlock).not.toMatch(
    /#the-call\s+\.plate\s*\{[^}]*background-size/,
  )
  expect(phoneBlock).not.toMatch(
    /#nations\s+\.plate\s*\{[^}]*background-size/,
  )
  expect(globalsSource).toMatch(
    /\.about-page\s+#born-again\s+\.plate,\s*\.about-page\s+#church\s+\.plate\s*\{[^}]*background-color:\s*#2a160f/,
  )
  expect(globalsSource).toMatch(
    /\.about-page\s+#born-again\s+\.plate,\s*\.about-page\s+#church\s+\.plate\s*\{[^}]*background-size:\s*contain/,
  )
  expect(globalsSource).toMatch(
    /\.about-page\s+\.plate\s*\{[^}]*background:[^;]*\/\s*cover/,
  )
})

test("≤800px hides about scene dots without reserved overlay space", () => {
  const phoneBlock = aboutPhoneMediaBlock(globalsSource)

  expect(globalsSource).toMatch(
    /\.about-page\s+\.about-scene-dots\s*\{[^}]*display:\s*flex/,
  )
  expect(phoneBlock).toMatch(
    /\.about-page\s+\.about-scene-dots\s*\{[^}]*display:\s*none/,
  )
  expect(phoneBlock).not.toMatch(
    /\.about-page\s+\.about-scene-dots\s*\{[^}]*(?:bottom:\s*1rem|padding:\s*0\.25rem)/,
  )
})
