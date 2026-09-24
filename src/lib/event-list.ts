import type { EventPhoto, EventRecord } from "@/content/events"

import { kolkataDateKey } from "./kolkata-date"

const KOLKATA = "Asia/Kolkata"

export type UpcomingEventRow = {
  id: string
  name: string
  start: string
  end: string
  revision: number
  description?: string
  photo?: EventPhoto
  featured: boolean
  tickDay: string
  tickTime: string | null
  whenLine: string
  scope: "This date only" | "These dates only"
}

function kolkataParts(
  iso: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KOLKATA,
    ...options,
  }).formatToParts(new Date(iso))
}

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((p) => p.type === type)?.value ?? ""
}

function tickDay(iso: string): string {
  const parts = kolkataParts(iso, { day: "numeric", month: "short" })
  return `${part(parts, "day")} ${part(parts, "month")}`
}

function formatClock(iso: string): { time: string; period: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KOLKATA,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(iso))
  const hour = part(parts, "hour")
  const minute = part(parts, "minute")
  const period = part(parts, "dayPeriod").toLowerCase()
  return { time: `${hour}:${minute}`, period }
}

function sameDayWhenLine(start: string, end: string): string {
  const dateParts = kolkataParts(start, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const dateLabel = `${part(dateParts, "weekday")}, ${part(dateParts, "day")} ${part(dateParts, "month")} ${part(dateParts, "year")}`
  const startClock = formatClock(start)
  const endClock = formatClock(end)
  const range =
    startClock.period === endClock.period
      ? `${startClock.time}–${endClock.time} ${startClock.period}`
      : `${startClock.time} ${startClock.period}–${endClock.time} ${endClock.period}`
  return `${dateLabel} · ${range} IST`
}

function multiDayWhenLine(start: string, end: string): string {
  const startParts = kolkataParts(start, {
    day: "numeric",
    month: "long",
  })
  const endParts = kolkataParts(end, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  return `${part(startParts, "day")} ${part(startParts, "month")} – ${part(endParts, "day")} ${part(endParts, "month")} ${part(endParts, "year")}`
}

function toRow(event: EventRecord): UpcomingEventRow {
  const sameDay = kolkataDateKey(event.start) === kolkataDateKey(event.end)
  const startClock = formatClock(event.start)
  return {
    id: event.id,
    name: event.name,
    start: event.start,
    end: event.end,
    revision: event.revision,
    description: event.description,
    photo: event.photo,
    featured: Boolean(event.featured),
    tickDay: tickDay(event.start),
    tickTime: sameDay
      ? `${startClock.time} ${startClock.period}`
      : null,
    whenLine: sameDay
      ? sameDayWhenLine(event.start, event.end)
      : multiDayWhenLine(event.start, event.end),
    scope: sameDay ? "This date only" : "These dates only",
  }
}

function byStart(a: EventRecord, b: EventRecord): number {
  return Date.parse(a.start) - Date.parse(b.start)
}

export function listUpcoming(
  events: EventRecord[],
  now: Date,
): UpcomingEventRow[] {
  const nowMs = now.getTime()
  const upcoming = events.filter((event) => nowMs < Date.parse(event.end))
  const featured = upcoming
    .filter((event) => event.featured)
    .toSorted(byStart)
  const rest = upcoming
    .filter((event) => !event.featured)
    .toSorted(byStart)
  return [...featured, ...rest].map(toRow)
}
