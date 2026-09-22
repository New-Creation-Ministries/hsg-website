import { expect, test } from "vitest"

import { home } from "./home"

test("names the church", () => {
  expect(home.name).toBe("Holy Spirit Generation")
})

test("says what the site will publish", () => {
  expect(home.summary).toBe(
    "Gatherings, news, and messages will be published here.",
  )
})
