import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test } from "vitest"

import { ContentInvariantError } from "@/lib/errors"

import { sections } from "../home"
import {
  assertEventsPublishable,
  events,
  sundayFeeds,
  type EventRecord,
} from "."

const moduleSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "index.ts"),
  "utf8",
)

function kolkataWeekday(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(new Date(iso))
}

function kolkataWindow(isoStart: string, isoEnd: string) {
  const start = isoStart.match(/T(\d{2}:\d{2}):\d{2}([+-]\d{2}:\d{2})$/)
  const end = isoEnd.match(/T(\d{2}:\d{2}):\d{2}([+-]\d{2}:\d{2})$/)
  return {
    start: start?.[1],
    end: end?.[1],
    startOffset: start?.[2],
    endOffset: end?.[2],
  }
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

test("publishes Voice of Apostles 2026 with a local photo, no venue, and no Unsplash import", () => {
  expect(events).toEqual([
    {
      id: "voice-of-apostles-2026",
      name: "Voice of Apostles 2026",
      start: "2026-09-30T18:00:00+05:30",
      end: "2026-10-03T21:00:00+05:30",
      revision: 1,
      featured: true,
      photo: {
        src: "/event-photos/voice-of-apostles-2026.jpg",
        alt: "Apostle Dr. P. S. Rambabu holding a microphone before a crowd, under the title Voice of Apostles",
      },
    },
  ])
  expect(moduleSource).toMatch(/\/event-photos\/voice-of-apostles-2026\.jpg/)
  expect(moduleSource).not.toMatch(/venue/i)
  expect(moduleSource).not.toMatch(/unsplash/i)
  expect(moduleSource).not.toMatch(/https?:/)
})

test("EventRecord fields are id, name, start, end, revision, and optional description, photo, featured", () => {
  const sample: EventRecord = {
    id: "inv-demo-042",
    name: "INV-DEMO-042",
    start: "2026-10-04T18:00:00+05:30",
    end: "2026-10-04T20:30:00+05:30",
    revision: 1,
    description: "Fixture body",
    photo: { src: "/fixtures/inv-demo.jpg", alt: "Fixture photograph" },
    featured: true,
  }
  expect(sample.start).toMatch(/\+05:30$/)
  expect(sample.end).toMatch(/\+05:30$/)
  expect(sample.photo).toEqual({
    src: "/fixtures/inv-demo.jpg",
    alt: "Fixture photograph",
  })
})

test("sundayFeeds is word-fest and miracles-and-healing with their own revisions", () => {
  expect(sundayFeeds.map((feed) => feed.id)).toEqual([
    "word-fest",
    "miracles-and-healing",
  ])
  for (const feed of sundayFeeds) {
    expect(Number.isInteger(feed.revision)).toBe(true)
    expect(feed.revision).toBeGreaterThanOrEqual(1)
    expect(kolkataWeekday(feed.start)).toBe("Sunday")
    expect(kolkataWeekday(feed.end)).toBe("Sunday")
    expect(feed).not.toHaveProperty("language")
    expect(feed).not.toHaveProperty("text")
  }
  const serialized = JSON.stringify(sundayFeeds)
  expect(serialized).not.toContain("English")
  expect(serialized).not.toContain("8–9am")
  expect(serialized).not.toContain("Multilingual")
  expect(serialized).not.toContain("9:30am onwards")
  expect(serialized).not.toContain("Word Fest Service")
  expect(serialized).not.toContain("Miracles and Healing Service")
})

test("word-fest is 08:00–09:00 and Home New to HSG? uses that clock", () => {
  const services = sections.find((section) => section.heading === "New to HSG?")
  const wordFestHome = services?.items.find(
    (item) => item.title === "Word Fest Service",
  )
  const wordFest = sundayFeeds.find((feed) => feed.id === "word-fest")

  expect(wordFestHome?.text).toBe("English\n08:00–09:00")
  expect(wordFest).toBeDefined()
  expect(kolkataWindow(wordFest!.start, wordFest!.end)).toEqual({
    start: "08:00",
    end: "09:00",
    startOffset: "+05:30",
    endOffset: "+05:30",
  })
})

test("miracles-and-healing is 09:30–13:30 and Home uses 09:30 onwards", () => {
  const services = sections.find((section) => section.heading === "New to HSG?")
  const miraclesHome = services?.items.find(
    (item) => item.title === "Miracles and Healing Service",
  )
  const miracles = sundayFeeds.find((feed) => feed.id === "miracles-and-healing")

  expect(miraclesHome?.text).toBe("Multilingual\n09:30 onwards")
  expect(miracles).toBeDefined()
  expect(kolkataWindow(miracles!.start, miracles!.end)).toEqual({
    start: "09:30",
    end: "13:30",
    startOffset: "+05:30",
    endOffset: "+05:30",
  })
})

test("assertEventsPublishable throws ContentInvariantError for missing name, start, or end", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  expect(() =>
    assertEventsPublishable(
      [baseEvent({ id: "a", name: "" })],
      now,
    ),
  ).toThrow(ContentInvariantError)
  expect(() =>
    assertEventsPublishable(
      [baseEvent({ id: "a", start: "" })],
      now,
    ),
  ).toThrow(ContentInvariantError)
  expect(() =>
    assertEventsPublishable(
      [baseEvent({ id: "a", end: "" })],
      now,
    ),
  ).toThrow(ContentInvariantError)
})

test("assertEventsPublishable throws ContentInvariantError when end is not after start", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  expect(() =>
    assertEventsPublishable(
      [
        baseEvent({
          id: "a",
          start: "2026-10-04T20:30:00+05:30",
          end: "2026-10-04T18:00:00+05:30",
        }),
      ],
      now,
    ),
  ).toThrow(ContentInvariantError)
  expect(() =>
    assertEventsPublishable(
      [
        baseEvent({
          id: "a",
          start: "2026-10-04T18:00:00+05:30",
          end: "2026-10-04T18:00:00+05:30",
        }),
      ],
      now,
    ),
  ).toThrow(ContentInvariantError)
})

test("assertEventsPublishable throws ContentInvariantError when revision is not an integer ≥ 1", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  expect(() =>
    assertEventsPublishable([baseEvent({ id: "a", revision: 0 })], now),
  ).toThrow(ContentInvariantError)
  expect(() =>
    assertEventsPublishable([baseEvent({ id: "a", revision: 1.5 })], now),
  ).toThrow(ContentInvariantError)
  expect(() =>
    assertEventsPublishable([baseEvent({ id: "a", revision: -1 })], now),
  ).toThrow(ContentInvariantError)
})

test("assertEventsPublishable throws ContentInvariantError when photo.src is set without alt", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  expect(() =>
    assertEventsPublishable(
      [baseEvent({ id: "a", photo: { src: "/x.jpg", alt: "" } })],
      now,
    ),
  ).toThrow(ContentInvariantError)
  expect(() =>
    assertEventsPublishable(
      [
        baseEvent({
          id: "a",
          photo: { src: "/x.jpg", alt: undefined as unknown as string },
        }),
      ],
      now,
    ),
  ).toThrow(ContentInvariantError)
})

test("assertEventsPublishable throws ContentInvariantError when more than two featured events end after now, without dropping extras", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  const threeFeatured = [
    baseEvent({
      id: "a",
      featured: true,
      start: "2026-10-01T10:00:00+05:30",
      end: "2026-10-01T12:00:00+05:30",
    }),
    baseEvent({
      id: "b",
      featured: true,
      start: "2026-10-02T10:00:00+05:30",
      end: "2026-10-02T12:00:00+05:30",
    }),
    baseEvent({
      id: "c",
      featured: true,
      start: "2026-10-03T10:00:00+05:30",
      end: "2026-10-03T12:00:00+05:30",
    }),
  ]
  expect(() => assertEventsPublishable(threeFeatured, now)).toThrow(
    ContentInvariantError,
  )
  expect(threeFeatured).toHaveLength(3)

  expect(() =>
    assertEventsPublishable(
      [
        ...threeFeatured.slice(0, 2),
        baseEvent({
          id: "past",
          featured: true,
          start: "2026-08-01T10:00:00+05:30",
          end: "2026-08-01T12:00:00+05:30",
        }),
      ],
      now,
    ),
  ).not.toThrow()
})

test("assertEventsPublishable accepts two featured upcoming events", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  expect(() =>
    assertEventsPublishable(
      [
        baseEvent({ id: "a", featured: true }),
        baseEvent({
          id: "b",
          featured: true,
          start: "2026-10-05T18:00:00+05:30",
          end: "2026-10-05T20:00:00+05:30",
        }),
      ],
      now,
    ),
  ).not.toThrow()
})

test("the events module does not call Date.now or new Date", () => {
  expect(moduleSource).not.toMatch(/\bDate\.now\b/)
  expect(moduleSource).not.toMatch(/\bnew Date\b/)
})
