import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "site-footer.tsx"), "utf8")

test("footer shows the ministry and address without a second navigation", () => {
  expect(source).toMatch(/from\s+["']@\/content\/home["']/)
  expect(source).toMatch(/\bpageNotes\b/)
  expect(source).toMatch(/pageNotes\.ministry/)
  expect(source).toMatch(/pageNotes\.address/)
  expect(source).not.toMatch(/church\.name/)
  expect(source).not.toMatch(/<nav\b/)
  expect(source).not.toMatch(/\bnav\b/)
  expect(source).not.toMatch(/usePathname/)
})
