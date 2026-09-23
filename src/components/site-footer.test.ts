import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "site-footer.tsx"), "utf8")

test("footer shows church name and footer note without a second navigation", () => {
  expect(source).toMatch(/from\s+["']@\/content\/home["']/)
  expect(source).toMatch(/\bchurch\b/)
  expect(source).toMatch(/\bpageNotes\b/)
  expect(source).toMatch(/pageNotes\.footer/)
  expect(source).toMatch(/church\.name/)
  expect(source).not.toMatch(/<nav\b/)
  expect(source).not.toMatch(/\bnav\b/)
  expect(source).not.toMatch(/usePathname/)
})
