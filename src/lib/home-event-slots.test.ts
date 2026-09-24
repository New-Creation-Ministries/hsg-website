import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

import type { EventRecord } from "@/content/events"
import type { HomeItem } from "@/content/home"

import { homeEventSlots } from "./home-event-slots"

const moduleSource = readFileSync(
  join(import.meta.dirname, "home-event-slots.ts"),
  "utf8",
)

const sundayServices: HomeItem[] = [
  { title: "Word Fest Service", text: "English\n08:00–09:00" },
  {
    title: "Miracles and Healing Service",
    text: "Multilingual\n09:30 onwards",
  },
]

const miraclesSlot = {
  kind: "service" as const,
  name: "Miracles and Healing Service",
  language: "Multilingual",
  time: "09:30 onwards",
}

const wordFestSlot = {
  kind: "service" as const,
  name: "Word Fest Service",
  language: "English",
  time: "08:00–09:00",
}

function baseEvent(
  overrides: Partial<EventRecord> & Pick<EventRecord, "id">,
): EventRecord {
  return {
    name: "INV-DEMO-042",
    start: "2026-10-04T18:00:00+05:30",
    end: "2026-10-04T20:30:00+05:30",
    revision: 1,
    ...overrides,
  }
}

const fixedNow = new Date("2026-09-01T00:00:00+05:30")

test("two featured → first featured, second featured", () => {
  const slots = homeEventSlots(
    [
      baseEvent({
        id: "featured-second",
        name: "Second Featured",
        featured: true,
        start: "2026-10-10T19:00:00+05:30",
        end: "2026-10-10T21:00:00+05:30",
      }),
      baseEvent({
        id: "featured-first",
        name: "First Featured",
        featured: true,
      }),
      baseEvent({
        id: "minor",
        name: "Later Minor",
        start: "2026-10-15T06:00:00+05:30",
        end: "2026-10-15T07:30:00+05:30",
      }),
    ],
    sundayServices,
    fixedNow,
  )
  expect(slots).toEqual([
    {
      kind: "dated",
      name: "First Featured",
      whenLine: "Sunday, 4 October 2026 · 6:00–8:30 pm IST",
    },
    {
      kind: "dated",
      name: "Second Featured",
      whenLine: "Saturday, 10 October 2026 · 7:00–9:00 pm IST",
    },
  ])
})

test("one featured → that featured, Miracles and Healing Service", () => {
  const slots = homeEventSlots(
    [
      baseEvent({
        id: "featured-only",
        name: "Only Featured",
        featured: true,
      }),
      baseEvent({
        id: "minor",
        name: "Later Minor",
        start: "2026-10-15T06:00:00+05:30",
        end: "2026-10-15T07:30:00+05:30",
      }),
    ],
    sundayServices,
    fixedNow,
  )
  expect(slots).toEqual([
    {
      kind: "dated",
      name: "Only Featured",
      whenLine: "Sunday, 4 October 2026 · 6:00–8:30 pm IST",
    },
    miraclesSlot,
  ])
})

test("none featured, two or more other dated → first two other dated", () => {
  const slots = homeEventSlots(
    [
      baseEvent({
        id: "second",
        name: "Second Dated",
        start: "2026-10-15T06:00:00+05:30",
        end: "2026-10-15T07:30:00+05:30",
      }),
      baseEvent({
        id: "first",
        name: "First Dated",
      }),
      baseEvent({
        id: "third",
        name: "Third Dated",
        start: "2026-10-20T06:00:00+05:30",
        end: "2026-10-20T07:30:00+05:30",
      }),
    ],
    sundayServices,
    fixedNow,
  )
  expect(slots).toEqual([
    {
      kind: "dated",
      name: "First Dated",
      whenLine: "Sunday, 4 October 2026 · 6:00–8:30 pm IST",
    },
    {
      kind: "dated",
      name: "Second Dated",
      whenLine: "Thursday, 15 October 2026 · 6:00–7:30 am IST",
    },
  ])
})

test("none featured, one other dated → that dated, Miracles and Healing Service", () => {
  const slots = homeEventSlots(
    [baseEvent({ id: "only", name: "Only Dated" })],
    sundayServices,
    fixedNow,
  )
  expect(slots).toEqual([
    {
      kind: "dated",
      name: "Only Dated",
      whenLine: "Sunday, 4 October 2026 · 6:00–8:30 pm IST",
    },
    miraclesSlot,
  ])
})

test("none upcoming → Miracles and Healing Service, Word Fest Service", () => {
  const slots = homeEventSlots(
    [
      baseEvent({
        id: "past",
        start: "2026-08-01T18:00:00+05:30",
        end: "2026-08-01T20:30:00+05:30",
      }),
    ],
    sundayServices,
    fixedNow,
  )
  expect(slots).toEqual([miraclesSlot, wordFestSlot])
})

test("homeEventSlots does not call Date.now or new Date", () => {
  expect(moduleSource).not.toMatch(/\bDate\.now\b/)
  expect(moduleSource).not.toMatch(/\bnew Date\b/)
})
