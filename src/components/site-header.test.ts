import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "site-header.tsx"), "utf8")

test("brand link is logo-only with church accessible name", () => {
  expect(source).toMatch(/aria-label=\{church\.name\}/)
  expect(source).toMatch(/src=["']\/brand\/hsg-logo\.jpg["']/)
  expect(source).toMatch(/alt=["']["']/)
  expect(source).not.toMatch(/<span>\s*\{church\.name\}\s*<\/span>/)
})

test("Menu breakpoint matchMedia queries use min-width 801px", () => {
  const matches = [...source.matchAll(/matchMedia\(\s*["']([^"']+)["']\s*\)/g)].map(
    (match) => match[1],
  )
  expect(matches).toEqual(["(min-width: 801px)", "(min-width: 801px)"])
})

test("Menu stays a disclosure button named Menu with ADR focus rules", () => {
  expect(source).toMatch(/className=["']menu-toggle["']/)
  expect(source).toMatch(/>\s*Menu\s*</)
  expect(source).toMatch(/aria-expanded=\{expanded\}/)
  expect(source).toMatch(/aria-label=["']Main navigation["']/)
  expect(source).toMatch(/event\.key === ["']Escape["']/)
  expect(source).toMatch(/menu\.current\?\.focus\(\)/)
  expect(source).toMatch(/\[aria-current=["']page["']\]/)
  expect(source).toMatch(/aria-current=\{pathname === href \? ["']page["'] : undefined\}/)
})
