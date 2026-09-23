import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "portrait-field.tsx"), "utf8")

test("is a client component that uses next/image with portrait alt", () => {
  expect(source).toMatch(/^["']use client["']/)
  expect(source).toMatch(/from\s+["']next\/image["']/)
  expect(source).toMatch(/portrait\.alt/)
  expect(source).toMatch(/\bfill\b/)
})

test("null or failed portrait shows aria-hidden HSG field with no caption", () => {
  expect(source).toMatch(/HSG/)
  expect(source).toMatch(/aria-hidden/)
  expect(source).toMatch(/onError/)
  expect(source).not.toMatch(/Leader portrait placeholder/)
  expect(source).not.toMatch(/figcaption/i)
  expect(source).not.toMatch(/Replace with an approved photograph/)
})
