import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "add-to-calendar.tsx"), "utf8")

test("summary accessible name includes event name and scope phrase", () => {
  expect(source).toMatch(/Add to calendar,\s*\$\{/)
  expect(source).toMatch(/this date only|these dates only|every Sunday/)
  expect(source).toMatch(/<details\b/)
  expect(source).toMatch(/<summary\b/)
})

test("menu offers Google and Apple Calendar named for the same item", () => {
  expect(source).toMatch(/Google Calendar/)
  expect(source).toMatch(/Apple Calendar/)
  expect(source).toMatch(/aria-label=\{`Google Calendar, \$\{name\}`\}/)
  expect(source).toMatch(/aria-label=\{`Apple Calendar, \$\{name\}`\}/)
})

test("Google and Apple hrefs use host and feed id; both open in a new tab", () => {
  expect(source).toMatch(
    /https:\/\/calendar\.google\.com\/calendar\/render\?cid=webcal:\/\//,
  )
  expect(source).toMatch(/\/events\/feeds\/\$\{|\/events\/feeds\/\{/)
  expect(source).toMatch(/\.ics/)
  expect(source).toMatch(/webcal:\/\//)
  expect(source).toMatch(
    /href=\{googleHref\}[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
  )
  expect(source).toMatch(
    /href=\{appleHref\}[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
  )
})
