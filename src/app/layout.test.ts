import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "layout.tsx"), "utf8")

function fontCall(name: string): string {
  const match = source.match(new RegExp(`${name}\\(\\{([\\s\\S]*?)\\}\\)`))
  expect(match, `${name}(...) call`).toBeTruthy()
  return match![1]
}

test("loads DM Sans as --font-sans and Oswald weight 500 as --font-display", () => {
  expect(source).toMatch(/from\s+["']next\/font\/google["']/)
  expect(source).toMatch(/\bDM_Sans\b/)
  expect(source).toMatch(/\bOswald\b/)
  expect(source).not.toMatch(/\bFraunces\b/)

  const dmSans = fontCall("DM_Sans")
  expect(dmSans).toMatch(/variable:\s*["']--font-sans["']/)
  expect(dmSans).toMatch(/display:\s*["']swap["']/)
  expect(dmSans).toMatch(/subsets:\s*\[["']latin["']\]/)

  const oswald = fontCall("Oswald")
  expect(oswald).toMatch(/variable:\s*["']--font-display["']/)
  expect(oswald).toMatch(/weight:\s*["']500["']/)
  expect(oswald).toMatch(/display:\s*["']swap["']/)
  expect(oswald).toMatch(/subsets:\s*\[["']latin["']\]/)
})

test("keeps metadata wired to church.name and leader.blurb", () => {
  expect(source).toMatch(
    /title:\s*\{\s*default:\s*church\.name,\s*template:\s*`%s \| \$\{church\.name\}`\s*\}/,
  )
  expect(source).toMatch(/description:\s*leader\.blurb/)
})

test("mounts the shared header and footer shell", () => {
  expect(source).toMatch(/import\s+\{\s*SiteHeader\s*\}\s+from\s+["']@\/components\/site-header["']/)
  expect(source).toMatch(/import\s+\{\s*SiteFooter\s*\}\s+from\s+["']@\/components\/site-footer["']/)
  expect(source).toMatch(/<SiteHeader\s*\/>/)
  expect(source).toMatch(/<SiteFooter\s*\/>/)
})
