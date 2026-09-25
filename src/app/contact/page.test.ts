import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "page.tsx"), "utf8")
const globalsSource = readFileSync(
  join(import.meta.dirname, "../globals.css"),
  "utf8",
)
const layoutSource = readFileSync(
  join(import.meta.dirname, "../layout.tsx"),
  "utf8",
)
const footerGateSource = readFileSync(
  join(import.meta.dirname, "../../components/site-footer-gate.tsx"),
  "utf8",
)

test("document title is Contact Us; page has no shell sentence", () => {
  expect(source).toMatch(/title:\s*["']Contact Us["']/)
  expect(source).not.toMatch(/This page will be published here/)
  expect(source).not.toMatch(/>\s*Contact Us\s*</)
})

test("imports contact content and anchors #main-content", () => {
  expect(source).toMatch(/from\s+["']@\/content\/contact["']/)
  expect(source).toMatch(/id=["']main-content["']/)
  expect(source).toMatch(/\bvisit\b/)
  expect(source).toMatch(/\barrival\b/)
  expect(source).toMatch(/\bcontactStrip\b/)
})

test("h1 is visit headline; WHEN YOU ARRIVE is next heading level", () => {
  expect(source).toMatch(/<h1[\s\S]*?visit\.headline/)
  expect(source).toMatch(/<h2[\s\S]*?arrival\.heading/)
})

test("http(s) links use G7 new-tab attrs; tel and mailto omit target blank", () => {
  const g7Pair =
    /target=["']_blank["'][\s\S]*?rel=["']noopener noreferrer["']|rel=["']noopener noreferrer["'][\s\S]*?target=["']_blank["']/
  expect(source).toMatch(
    new RegExp(
      String.raw`href=\{visit\.directions\.href\}[\s\S]*?(?:${g7Pair.source})`,
    ),
  )
  expect(source).toMatch(
    new RegExp(String.raw`href=\{fact\.href\}[\s\S]*?(?:${g7Pair.source})`),
  )
  expect(source).toMatch(
    new RegExp(String.raw`href=\{social\.href\}[\s\S]*?(?:${g7Pair.source})`),
  )
  expect(source).toMatch(/href=\{contactStrip\.phone\.href\}/)
  expect(source).toMatch(/href=\{contactStrip\.email\.href\}/)
  expect(source).not.toMatch(
    /href=\{contactStrip\.phone\.href\}[^>]*target=["']_blank["']/,
  )
  expect(source).not.toMatch(
    /href=\{contactStrip\.email\.href\}[^>]*target=["']_blank["']/,
  )
})

test("page does not mount SiteFooter; cream strip is page content", () => {
  expect(source).not.toMatch(/SiteFooter/)
  expect(source).toMatch(/contactStrip|contact-strip|contact-help/)
  expect(layoutSource).toMatch(/SiteFooterGate/)
  expect(footerGateSource).toMatch(
    /pathname\s*===\s*["']\/contact["'][\s\S]*?return\s+null/,
  )
})

test("contact CSS is scoped under .contact-page", () => {
  expect(globalsSource).toMatch(/\.contact-page\b/)
  expect(globalsSource).toMatch(
    /\.contact-page[\s\S]*contact-desk|\.contact-page\s+\.contact-desk/,
  )
  expect(globalsSource).toMatch(
    /\.contact-page[\s\S]*contact-strip|\.contact-page\s+\.contact-strip/,
  )
})
