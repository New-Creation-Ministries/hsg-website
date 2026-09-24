import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "site-footer.tsx"), "utf8")

test("footer shows the ministry, church name above the address, and social links without a second navigation", () => {
  expect(source).toMatch(/from\s+["']@\/content\/home["']/)
  expect(source).toMatch(/\bpageNotes\b/)
  expect(source).toMatch(/pageNotes\.ministry/)
  expect(source).toMatch(/church\.name/)
  expect(source).toMatch(/pageNotes\.address/)
  expect(source).toMatch(/facebook\.com\/people\/Evangelist-Rambabu-Rambo/)
  expect(source).toMatch(/instagram\.com\/holyspiritgeneration777/)
  expect(source).toMatch(/youtube\.com\/c\/EvangelistRambabuRambo/)
  expect(source).not.toMatch(/<nav\b/)
  expect(source).not.toMatch(/\bnav\b/)
  expect(source).not.toMatch(/usePathname/)
})
