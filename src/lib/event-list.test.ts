import { expect, test } from "vitest"

import type { EventRecord } from "@/content/events"

import { listUpcoming } from "./event-list"

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

test("listUpcoming returns zero rows when nothing is upcoming (A2)", () => {
  const now = new Date("2026-10-05T00:00:00+05:30")
  const rows = listUpcoming(
    [
      baseEvent({
        id: "past",
        start: "2026-10-04T18:00:00+05:30",
        end: "2026-10-04T20:30:00+05:30",
      }),
    ],
    now,
  )
  expect(rows).toEqual([])
})

test("listUpcoming returns one featured row without padding (A2)", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  const rows = listUpcoming(
    [
      baseEvent({
        id: "inv-demo-042",
        featured: true,
        description: "Fixture body",
        photo: { src: "/fixtures/inv-demo.jpg", alt: "Fixture photograph" },
      }),
    ],
    now,
  )
  expect(rows).toHaveLength(1)
  expect(rows[0]?.id).toBe("inv-demo-042")
  expect(rows[0]?.featured).toBe(true)
  expect(rows[0]?.tickDay).toBe("4 Oct")
  expect(rows[0]?.tickTime).toBe("6:00 pm")
  expect(rows[0]?.whenLine).toBe(
    "Sunday, 4 October 2026 · 6:00–8:30 pm IST",
  )
  expect(rows[0]?.scope).toBe("This date only")
})

test("listUpcoming puts two featured rows before a later minor row (A1)", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  const rows = listUpcoming(
    [
      baseEvent({
        id: "minor-later",
        start: "2026-10-15T06:00:00+05:30",
        end: "2026-10-15T07:30:00+05:30",
      }),
      baseEvent({
        id: "featured-second",
        featured: true,
        start: "2026-10-10T19:00:00+05:30",
        end: "2026-10-10T21:00:00+05:30",
      }),
      baseEvent({
        id: "featured-first",
        featured: true,
        start: "2026-10-04T18:00:00+05:30",
        end: "2026-10-04T20:30:00+05:30",
      }),
    ],
    now,
  )
  expect(rows.map((row) => row.id)).toEqual([
    "featured-first",
    "featured-second",
    "minor-later",
  ])
})

test("listUpcoming drops a row after end with no other change (A8)", () => {
  const events = [
    baseEvent({
      id: "inv-demo-042",
      featured: true,
      start: "2026-10-04T18:00:00+05:30",
      end: "2026-10-04T20:30:00+05:30",
    }),
    baseEvent({
      id: "still-up",
      start: "2026-10-15T06:00:00+05:30",
      end: "2026-10-15T07:30:00+05:30",
    }),
  ]
  const before = listUpcoming(
    events,
    new Date("2026-10-04T20:00:00+05:30"),
  )
  expect(before.map((row) => row.id)).toEqual(["inv-demo-042", "still-up"])

  const after = listUpcoming(
    events,
    new Date("2026-10-04T20:30:00+05:30"),
  )
  expect(after.map((row) => row.id)).toEqual(["still-up"])
  expect(after[0]?.whenLine).toBe(
    "Thursday, 15 October 2026 · 6:00–7:30 am IST",
  )
})

test("listUpcoming keeps a conference listed after day one and before end", () => {
  const rows = listUpcoming(
    [
      baseEvent({
        id: "inv-demo-042",
        start: "2026-10-05T08:00:00+05:30",
        end: "2026-10-09T17:00:00+05:30",
      }),
    ],
    new Date("2026-10-07T12:00:00+05:30"),
  )
  expect(rows).toHaveLength(1)
  expect(rows[0]?.whenLine).toBe("5 October – 9 October 2026")
  expect(rows[0]?.scope).toBe("These dates only")
})

test("listUpcoming keeps Monday 5 Oct through Friday 9 Oct as one conference row (A9)", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  const rows = listUpcoming(
    [
      baseEvent({
        id: "inv-demo-042",
        start: "2026-10-05T08:00:00+05:30",
        end: "2026-10-09T17:00:00+05:30",
      }),
    ],
    now,
  )
  expect(rows).toHaveLength(1)
  expect(rows[0]?.id).toBe("inv-demo-042")
  expect(rows[0]?.tickDay).toBe("5 Oct")
  expect(rows[0]?.tickTime).toBeNull()
  expect(rows[0]?.whenLine).toBe("5 October – 9 October 2026")
  expect(rows[0]?.scope).toBe("These dates only")
})

test("listUpcoming sorts equal starts by module order within each group", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  const rows = listUpcoming(
    [
      baseEvent({
        id: "feat-a",
        featured: true,
        start: "2026-10-04T18:00:00+05:30",
        end: "2026-10-04T20:00:00+05:30",
      }),
      baseEvent({
        id: "feat-b",
        featured: true,
        start: "2026-10-04T18:00:00+05:30",
        end: "2026-10-04T20:00:00+05:30",
      }),
      baseEvent({
        id: "minor-a",
        start: "2026-10-05T10:00:00+05:30",
        end: "2026-10-05T11:00:00+05:30",
      }),
      baseEvent({
        id: "minor-b",
        start: "2026-10-05T10:00:00+05:30",
        end: "2026-10-05T11:00:00+05:30",
      }),
    ],
    now,
  )
  expect(rows.map((row) => row.id)).toEqual([
    "feat-a",
    "feat-b",
    "minor-a",
    "minor-b",
  ])
})

test("listUpcoming labels use Asia/Kolkata only", () => {
  const now = new Date("2026-09-01T00:00:00+05:30")
  // 20:30 UTC on 4 Oct is 02:00 on 5 Oct in Asia/Kolkata.
  const rows = listUpcoming(
    [
      baseEvent({
        id: "inv-demo-042",
        start: "2026-10-04T20:30:00Z",
        end: "2026-10-05T04:00:00Z",
      }),
    ],
    now,
  )
  expect(rows[0]?.tickDay).toBe("5 Oct")
  expect(rows[0]?.whenLine).toContain("5 October 2026")
  expect(rows[0]?.whenLine).not.toContain("4 October")
  expect(rows[0]?.whenLine).not.toMatch(/UTC|GMT|America|Europe/)
})
