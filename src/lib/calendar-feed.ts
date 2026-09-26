import {
  events as publishedEvents,
  sundayFeeds as publishedSundayFeeds,
  type EventRecord,
  type SundayFeedRecord,
} from "@/content/events"
import { sections } from "@/content/home"
import { ContentInvariantError } from "@/lib/errors"

import { kolkataDateKey } from "./kolkata-date"

const KOLKATA = "Asia/Kolkata"
const CRLF = "\r\n"

const SUNDAY_HOME_TITLE = {
  "word-fest": "Word Fest Service",
  "miracles-and-healing": "Miracles and Healing Service",
} as const

export type CalendarFeedOptions = {
  dtstamp: Date
  events?: readonly EventRecord[]
  sundayFeeds?: readonly SundayFeedRecord[]
}

type FeedEvent = {
  uid: string
  summary: string
  sequence: number
  dtstamp: string
  dtstart: string
  dtend: string
  rrule?: string
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function formatDtstamp(instant: Date): string {
  return (
    `${instant.getUTCFullYear()}${pad2(instant.getUTCMonth() + 1)}${pad2(instant.getUTCDate())}` +
    `T${pad2(instant.getUTCHours())}${pad2(instant.getUTCMinutes())}${pad2(instant.getUTCSeconds())}Z`
  )
}

function formatLocalFromIso(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(iso)
  if (!match) {
    throw new ContentInvariantError({
      module: "src/lib/calendar-feed.ts",
      rule: "iso-local-datetime",
      message: `Invalid ISO datetime: ${iso}`,
    })
  }
  return `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}${match[6]}`
}

function nextCalendarDay(yyyyMmDd: string): string {
  const [year, month, day] = yyyyMmDd.split("-").map(Number)
  const next = new Date(Date.UTC(year!, month! - 1, day! + 1))
  return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`
}

function eachIstDateInclusive(startIso: string, endIso: string): string[] {
  const start = kolkataDateKey(startIso)
  const end = kolkataDateKey(endIso)
  const dates: string[] = []
  let current = start
  while (current <= end) {
    dates.push(current)
    current = nextCalendarDay(current)
  }
  return dates
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

function sundaySummary(id: string): string {
  const expected =
    SUNDAY_HOME_TITLE[id as keyof typeof SUNDAY_HOME_TITLE]
  if (!expected) {
    throw new ContentInvariantError({
      module: "src/lib/calendar-feed.ts",
      rule: "known-sunday-feed-id",
      message: `Unknown Sunday feed id: ${id}`,
    })
  }
  const services = sections.find((section) => section.heading === "New to HSG?")
  const title = services?.items.find((item) => item.title === expected)?.title
  if (!title) {
    throw new ContentInvariantError({
      module: "src/lib/calendar-feed.ts",
      rule: "sunday-home-title",
      message: `${expected} Home title missing`,
    })
  }
  return title
}

function datedEvents(
  record: EventRecord,
  dtstamp: string,
): FeedEvent[] {
  const startKey = kolkataDateKey(record.start)
  const endKey = kolkataDateKey(record.end)
  if (startKey === endKey) {
    return [
      {
        uid: record.id,
        summary: record.name,
        sequence: record.revision,
        dtstamp,
        dtstart: formatLocalFromIso(record.start),
        dtend: formatLocalFromIso(record.end),
      },
    ]
  }

  return eachIstDateInclusive(record.start, record.end).map((date) => {
    const compact = date.replace(/-/g, "")
    return {
      uid: `${record.id}/${date}`,
      summary: record.name,
      sequence: record.revision,
      dtstamp,
      dtstart: `${compact}T080000`,
      dtend: `${compact}T083000`,
    }
  })
}

function sundayEvent(
  record: SundayFeedRecord,
  dtstamp: string,
): FeedEvent {
  return {
    uid: record.id,
    summary: sundaySummary(record.id),
    sequence: record.revision,
    dtstamp,
    dtstart: formatLocalFromIso(record.start),
    dtend: formatLocalFromIso(record.end),
    rrule: "FREQ=WEEKLY;BYDAY=SU",
  }
}

function renderVevent(event: FeedEvent): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${event.dtstamp}`,
    `DTSTART;TZID=${KOLKATA}:${event.dtstart}`,
    `DTEND;TZID=${KOLKATA}:${event.dtend}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `SEQUENCE:${event.sequence}`,
  ]
  if (event.rrule) {
    lines.push(`RRULE:${event.rrule}`)
  }
  lines.push("END:VEVENT")
  return lines.join(CRLF)
}

/** Builds one METHOD:PUBLISH iCalendar document for an addable id. Does not read the clock. */
export function calendarFeed(
  id: string,
  options: CalendarFeedOptions,
): string {
  const dtstamp = formatDtstamp(options.dtstamp)
  const dated = options.events ?? publishedEvents
  const sundays = options.sundayFeeds ?? publishedSundayFeeds

  const sunday = sundays.find((feed) => feed.id === id)
  let vevents: FeedEvent[]
  let calName: string
  if (sunday) {
    vevents = [sundayEvent(sunday, dtstamp)]
    calName = vevents[0]!.summary
  } else {
    const record = dated.find((event) => event.id === id)
    if (!record) {
      throw new ContentInvariantError({
        module: "src/lib/calendar-feed.ts",
        rule: "known-feed-id",
        message: `Unknown calendar feed id: ${id}`,
      })
    }
    vevents = datedEvents(record, dtstamp)
    calName = record.name
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Holy Spirit Generation//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calName)}`,
    ...vevents.map(renderVevent),
    "END:VCALENDAR",
  ]
  return lines.join(CRLF) + CRLF
}
