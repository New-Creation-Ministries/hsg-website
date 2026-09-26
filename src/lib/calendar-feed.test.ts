import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, expect, test, vi } from "vitest"

import type { EventRecord } from "@/content/events"
import { sundayFeeds } from "@/content/events"
import { ContentInvariantError } from "@/lib/errors"

import { calendarFeed } from "./calendar-feed"

afterEach(() => {
  vi.doUnmock("@/content/home")
  vi.resetModules()
})

const moduleSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "calendar-feed.ts"),
  "utf8",
)

const DTSTAMP = new Date("2026-09-24T10:00:00.000Z")

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

function feedLines(body: string): string[] {
  return body.replace(/\r\n/g, "\n").split("\n").filter(Boolean)
}

function veventBlocks(body: string): string[] {
  const normalized = body.replace(/\r\n/g, "\n")
  const parts = normalized.split("BEGIN:VEVENT\n").slice(1)
  return parts.map((part) => {
    const inner = part.split("\nEND:VEVENT")[0] ?? ""
    return inner
  })
}

function property(block: string, name: string): string | undefined {
  const line = feedLines(block).find(
    (entry) => entry === name || entry.startsWith(`${name}`) || entry.startsWith(`${name};`) || entry.startsWith(`${name}:`),
  )
  if (!line) return undefined
  const colon = line.indexOf(":")
  return colon === -1 ? undefined : line.slice(colon + 1)
}

test("calendarFeed emits METHOD:PUBLISH with SEQUENCE, DTSTAMP, and SUMMARY (A4)", () => {
  const body = calendarFeed("inv-demo-042", {
    dtstamp: DTSTAMP,
    events: [baseEvent({ id: "inv-demo-042" })],
  })
  const lines = feedLines(body)
  expect(lines).toContain("METHOD:PUBLISH")
  expect(body).not.toContain("METHOD:CANCEL")
  expect(lines).toContain("X-WR-CALNAME:INV-DEMO-042")

  const events = veventBlocks(body)
  expect(events).toHaveLength(1)
  expect(property(events[0]!, "UID")).toBe("inv-demo-042")
  expect(property(events[0]!, "SEQUENCE")).toBe("1")
  expect(property(events[0]!, "DTSTAMP")).toBe("20260924T100000Z")
  expect(property(events[0]!, "SUMMARY")).toBe("INV-DEMO-042")
  expect(events[0]).toContain("DTSTART;TZID=Asia/Kolkata:20261004T180000")
  expect(events[0]).toContain("DTEND;TZID=Asia/Kolkata:20261004T203000")
})

test("same IST date yields one VEVENT for the real interval (A4)", () => {
  const body = calendarFeed("inv-demo-042", {
    dtstamp: DTSTAMP,
    events: [baseEvent({ id: "inv-demo-042" })],
  })
  expect(veventBlocks(body)).toHaveLength(1)
  expect(property(veventBlocks(body)[0]!, "UID")).toBe("inv-demo-042")
})

test("Mon 5 Oct–Fri 9 Oct yields five 08:00–08:30 reminders and none on 4 or 10 Oct (A9)", () => {
  const body = calendarFeed("inv-demo-042", {
    dtstamp: DTSTAMP,
    events: [
      baseEvent({
        id: "inv-demo-042",
        start: "2026-10-05T09:00:00+05:30",
        end: "2026-10-09T17:00:00+05:30",
      }),
    ],
  })
  const events = veventBlocks(body)
  expect(events).toHaveLength(5)

  const uids = events.map((block) => property(block, "UID"))
  expect(uids).toEqual([
    "inv-demo-042/2026-10-05",
    "inv-demo-042/2026-10-06",
    "inv-demo-042/2026-10-07",
    "inv-demo-042/2026-10-08",
    "inv-demo-042/2026-10-09",
  ])
  expect(uids.join("\n")).not.toContain("2026-10-04")
  expect(uids.join("\n")).not.toContain("2026-10-10")

  for (const block of events) {
    expect(block).toMatch(/DTSTART;TZID=Asia\/Kolkata:2026100[5-9]T080000/)
    expect(block).toMatch(/DTEND;TZID=Asia\/Kolkata:2026100[5-9]T083000/)
    expect(property(block, "SUMMARY")).toBe("INV-DEMO-042")
    expect(property(block, "SEQUENCE")).toBe("1")
  }
})

test("word-fest is a weekly Sunday VEVENT 08:00–09:00 with fixed seed DTSTART (A3)", () => {
  const wordFest = sundayFeeds.find((feed) => feed.id === "word-fest")
  expect(wordFest).toBeDefined()

  const body = calendarFeed("word-fest", { dtstamp: DTSTAMP })
  const events = veventBlocks(body)
  expect(events).toHaveLength(1)
  expect(events[0]).toContain("RRULE:FREQ=WEEKLY;BYDAY=SU")
  expect(events[0]).toContain("DTSTART;TZID=Asia/Kolkata:20260104T080000")
  expect(events[0]).toContain("DTEND;TZID=Asia/Kolkata:20260104T090000")
  expect(property(events[0]!, "UID")).toBe("word-fest")
  expect(property(events[0]!, "SEQUENCE")).toBe(String(wordFest!.revision))
  expect(property(events[0]!, "DTSTAMP")).toBe("20260924T100000Z")
  expect(property(events[0]!, "SUMMARY")).toBe("Word Fest Service")
  expect(feedLines(body)).toContain("X-WR-CALNAME:Word Fest Service")
})

test("miracles-and-healing is weekly Sunday 09:30–13:30 with fixed seed DTSTART (A3)", () => {
  const miracles = sundayFeeds.find(
    (feed) => feed.id === "miracles-and-healing",
  )
  expect(miracles).toBeDefined()

  const body = calendarFeed("miracles-and-healing", { dtstamp: DTSTAMP })
  const events = veventBlocks(body)
  expect(events).toHaveLength(1)
  expect(events[0]).toContain("RRULE:FREQ=WEEKLY;BYDAY=SU")
  expect(events[0]).toContain("DTSTART;TZID=Asia/Kolkata:20260104T093000")
  expect(events[0]).toContain("DTEND;TZID=Asia/Kolkata:20260104T133000")
  expect(property(events[0]!, "UID")).toBe("miracles-and-healing")
  expect(property(events[0]!, "SEQUENCE")).toBe(String(miracles!.revision))
  expect(property(events[0]!, "SUMMARY")).toBe(
    "Miracles and Healing Service",
  )
})

test("raising revision and changing end keeps UIDs and writes new SEQUENCE and interval (A5)", () => {
  const first = calendarFeed("inv-demo-042", {
    dtstamp: DTSTAMP,
    events: [
      baseEvent({
        id: "inv-demo-042",
        start: "2026-10-05T09:00:00+05:30",
        end: "2026-10-09T17:00:00+05:30",
        revision: 1,
      }),
    ],
  })
  const second = calendarFeed("inv-demo-042", {
    dtstamp: new Date("2026-09-25T12:00:00.000Z"),
    events: [
      baseEvent({
        id: "inv-demo-042",
        start: "2026-10-05T09:00:00+05:30",
        end: "2026-10-08T17:00:00+05:30",
        revision: 2,
      }),
    ],
  })

  const firstUids = veventBlocks(first).map((block) => property(block, "UID"))
  const secondBlocks = veventBlocks(second)
  const secondUids = secondBlocks.map((block) => property(block, "UID"))

  expect(secondUids).toEqual([
    "inv-demo-042/2026-10-05",
    "inv-demo-042/2026-10-06",
    "inv-demo-042/2026-10-07",
    "inv-demo-042/2026-10-08",
  ])
  expect(firstUids.slice(0, 4)).toEqual(secondUids)
  for (const block of secondBlocks) {
    expect(property(block, "SEQUENCE")).toBe("2")
    expect(property(block, "DTSTAMP")).toBe("20260925T120000Z")
  }
})

test("raising revision and changing end on a same-day record keeps the id UID (A5)", () => {
  const second = calendarFeed("inv-demo-042", {
    dtstamp: new Date("2026-09-25T12:00:00.000Z"),
    events: [
      baseEvent({
        id: "inv-demo-042",
        start: "2026-10-04T18:00:00+05:30",
        end: "2026-10-04T21:00:00+05:30",
        revision: 2,
      }),
    ],
  })
  const block = veventBlocks(second)[0]!
  expect(veventBlocks(second)).toHaveLength(1)
  expect(property(block, "UID")).toBe("inv-demo-042")
  expect(property(block, "SEQUENCE")).toBe("2")
  expect(block).toContain("DTEND;TZID=Asia/Kolkata:20261004T210000")
})

test("unknown id throws ContentInvariantError", () => {
  expect(() =>
    calendarFeed("missing-event", {
      dtstamp: DTSTAMP,
      events: [baseEvent({ id: "inv-demo-042" })],
    }),
  ).toThrow(ContentInvariantError)
})

test("invalid ISO local datetime throws ContentInvariantError", () => {
  expect(() =>
    calendarFeed("inv-demo-042", {
      dtstamp: DTSTAMP,
      events: [
        baseEvent({
          id: "inv-demo-042",
          start: "2026-10-04T18:00+05:30",
          end: "2026-10-04T20:30+05:30",
        }),
      ],
    }),
  ).toThrow(ContentInvariantError)
})

test("unknown Sunday feed id throws ContentInvariantError", () => {
  expect(() =>
    calendarFeed("custom-sunday", {
      dtstamp: DTSTAMP,
      sundayFeeds: [
        {
          id: "custom-sunday",
          start: "2026-01-04T08:00:00+05:30",
          end: "2026-01-04T09:00:00+05:30",
          revision: 1,
          weekly: true,
        },
      ],
    }),
  ).toThrow(ContentInvariantError)
})

test("missing Sunday Home title throws ContentInvariantError", async () => {
  vi.resetModules()
  vi.doMock("@/content/home", () => ({
    sections: [
      {
        heading: "New to HSG?",
        items: [],
      },
    ],
  }))
  const { ContentInvariantError: ErrorClass } = await import("@/lib/errors")
  const { calendarFeed: feed } = await import("./calendar-feed")
  expect(() =>
    feed("word-fest", {
      dtstamp: DTSTAMP,
      sundayFeeds: [
        {
          id: "word-fest",
          start: "2026-01-04T08:00:00+05:30",
          end: "2026-01-04T09:00:00+05:30",
          revision: 1,
          weekly: true,
        },
      ],
    }),
  ).toThrow(ErrorClass)
})

test("calendar-feed does not emit METHOD:CANCEL and does not read the clock", () => {
  expect(moduleSource).not.toMatch(/METHOD:CANCEL/)
  expect(moduleSource).not.toMatch(/\bDate\.now\b/)
  expect(moduleSource).not.toMatch(/\bnew Date\(\s*\)/)
})
